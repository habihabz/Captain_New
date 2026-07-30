using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using BarcodePrinting.Models;
using Newtonsoft.Json;

namespace BarcodePrinting
{
    public partial class Form1 : Form
    {
        [System.Runtime.InteropServices.DllImport("user32.dll", CharSet = System.Runtime.InteropServices.CharSet.Auto)]
        private static extern Int32 SendMessage(IntPtr hWnd, int msg, int wParam, [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPWStr)] string lParam);
        private const int EM_SETCUEBANNER = 0x1501;

        private List<CustomerOrder> allOrders = new List<CustomerOrder>();
        private List<CustomerOrder> filteredOrders = new List<CustomerOrder>();
        private Dictionary<string, string> appConstants = new Dictionary<string, string>();

        // Pagination & Sorting State
        private int currentPage = 1;
        private int pageSize = 50;
        private string sortColumn = "co_id";
        private bool sortAscending = false; // Descending by default for newest first
        private bool isUpdatingGrid = false;

        // UI Controls for Pagination & Filters
        private Panel pnlPagination;
        private Button btnPrevPage;
        private Button btnNextPage;
        private Label lblPageInfo;
        private Panel pnlFilters;
        private Dictionary<string, TextBox> filterBoxes = new Dictionary<string, TextBox>();

        public Form1()
        {
            InitializeComponent();
            SendMessage(txtSearch.Handle, EM_SETCUEBANNER, 1, "Search Order ID...");
            InitializeGridFeatures();
            LoadLogo();
            LoadTheme();
            // Start in Login state
            pnlLogin.Visible = true;
            pnlMain.Visible = false;

            dataGridViewOrders.DataBindingComplete += DataGridViewOrders_DataBindingComplete;
            dataGridViewOrders.CellContentClick += DataGridViewOrders_CellContentClick;
            
            // Enable double buffering to fix slowness and flickering
            typeof(DataGridView).InvokeMember("DoubleBuffered", 
                System.Reflection.BindingFlags.NonPublic | 
                System.Reflection.BindingFlags.Instance | 
                System.Reflection.BindingFlags.SetProperty, 
                null, dataGridViewOrders, new object[] { true });
                
            typeof(Panel).InvokeMember("DoubleBuffered", 
                System.Reflection.BindingFlags.NonPublic | 
                System.Reflection.BindingFlags.Instance | 
                System.Reflection.BindingFlags.SetProperty, 
                null, pnlHeader, new object[] { true });

            this.DoubleBuffered = true;
            pnlHeader.Resize += (s, e) => pnlHeader.Invalidate();

            dataGridViewOrders.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dataGridViewOrders.CellFormatting += DataGridViewOrders_CellFormatting;

            // Bind empty list to force column generation on startup
            dataGridViewOrders.DataSource = new List<CustomerOrder>();
        }

        private void InitializeGridFeatures()
        {
            // Content container to provide margins
            Panel pnlContent = new Panel { Dock = DockStyle.Fill, Padding = new Padding(1, 1, 1, 1), BackColor = Color.White };
            pnlMain.Controls.Remove(dataGridViewOrders);

            // Pagination Panel
            pnlPagination = new Panel { Dock = DockStyle.Bottom, Height = 50, BackColor = Color.FromArgb(24, 24, 27) };
            
            btnPrevPage = new Button { Text = "◀ Previous", FlatStyle = FlatStyle.Flat, ForeColor = Color.White, BackColor = Color.FromArgb(63, 63, 70), Size = new Size(100, 30), Cursor = Cursors.Hand };
            btnNextPage = new Button { Text = "Next ▶", FlatStyle = FlatStyle.Flat, ForeColor = Color.White, BackColor = Color.FromArgb(63, 63, 70), Size = new Size(100, 30), Cursor = Cursors.Hand };
            lblPageInfo = new Label { Text = "Page 1 of 1", ForeColor = Color.White, AutoSize = false, Size = new Size(150, 30), TextAlign = ContentAlignment.MiddleCenter };

            btnPrevPage.FlatAppearance.BorderSize = 0;
            btnNextPage.FlatAppearance.BorderSize = 0;

            btnPrevPage.Click += (s, e) => { if (currentPage > 1) { currentPage--; RefreshGrid(); } };
            btnNextPage.Click += (s, e) => { int max = (int)Math.Ceiling(filteredOrders.Count / (double)pageSize); if (currentPage < max) { currentPage++; RefreshGrid(); } };

            pnlPagination.Resize += (s, e) =>
            {
                int totalWidth = btnPrevPage.Width + lblPageInfo.Width + btnNextPage.Width + 20;
                int startX = (pnlPagination.Width - totalWidth) / 2;
                btnPrevPage.Location = new Point(startX, 10);
                lblPageInfo.Location = new Point(startX + btnPrevPage.Width + 10, 10);
                btnNextPage.Location = new Point(lblPageInfo.Right + 10, 10);
            };

            pnlPagination.Controls.Add(btnPrevPage);
            pnlPagination.Controls.Add(lblPageInfo);
            pnlPagination.Controls.Add(btnNextPage);
            
            pnlContent.Controls.Add(pnlPagination);
            
            // Filter Panel
            pnlFilters = new Panel { Dock = DockStyle.Top, Height = 65, BackColor = Color.FromArgb(39, 39, 42) };
            string[] filterCols = { "co_id:Order ID", "co_customer_name:Customer", "co_customer_phone:Phone", "co_product_name:Product", "co_status_name:Status", "co_waybill:Waybill" };
            
            int xPos = 10;
            foreach (var colDef in filterCols)
            {
                var parts = colDef.Split(':');
                var lbl = new Label { Text = parts[1], ForeColor = Color.White, AutoSize = true, Location = new Point(xPos, 5), Font = new Font("Segoe UI", 9) };
                var txt = new TextBox { Name = parts[0], Width = 120, Location = new Point(xPos, 22), BackColor = Color.FromArgb(24, 24, 27), ForeColor = Color.White, BorderStyle = BorderStyle.FixedSingle, TextAlign = HorizontalAlignment.Center };
                txt.TextChanged += (s, e) => { ApplyFilters(); };
                
                pnlFilters.Controls.Add(lbl);
                pnlFilters.Controls.Add(txt);
                filterBoxes.Add(parts[0], txt);
                xPos += 130;
            }

            Action updateFilterPositions = () =>
            {
                if (isUpdatingGrid || dataGridViewOrders.Columns.Count == 0) return;
                
                foreach (var colDef in filterCols)
                {
                    string name = colDef.Split(':')[0];
                    if (filterBoxes.ContainsKey(name) && dataGridViewOrders.Columns.Contains(name))
                    {
                        var txt = filterBoxes[name];
                        var col = dataGridViewOrders.Columns[name];
                        
                        if (col.Visible)
                        {
                            var rect = dataGridViewOrders.GetColumnDisplayRectangle(col.Index, true);
                            if (rect.Width > 0)
                            {
                                txt.Visible = true;
                                int padding = 10;
                                txt.Width = rect.Width - padding;
                                txt.Location = new Point(rect.X + (padding / 2), 22);
                                
                                int idx = pnlFilters.Controls.IndexOf(txt);
                                if (idx > 0 && pnlFilters.Controls[idx - 1] is Label lbl)
                                {
                                    lbl.Location = new Point(rect.X + (rect.Width - lbl.Width) / 2, 5);
                                    lbl.Visible = true;
                                }
                            }
                            else
                            {
                                txt.Visible = false;
                                int idx = pnlFilters.Controls.IndexOf(txt);
                                if (idx > 0 && pnlFilters.Controls[idx - 1] is Label lbl) lbl.Visible = false;
                            }
                        }
                        else
                        {
                            txt.Visible = false;
                            int idx = pnlFilters.Controls.IndexOf(txt);
                            if (idx > 0 && pnlFilters.Controls[idx - 1] is Label lbl) lbl.Visible = false;
                        }
                    }
                }
            };

            dataGridViewOrders.ColumnWidthChanged += (s, e) => updateFilterPositions();
            dataGridViewOrders.Scroll += (s, e) => updateFilterPositions();
            dataGridViewOrders.Resize += (s, e) => updateFilterPositions();
            pnlFilters.Resize += (s, e) => updateFilterPositions();
            dataGridViewOrders.DataBindingComplete += (s, e) => { FormatGrid(); updateFilterPositions(); };

            pnlContent.Controls.Add(pnlFilters);
            pnlContent.Controls.Add(dataGridViewOrders);

            // Enforce correct Z-order inside content panel
            pnlPagination.SendToBack();
            pnlFilters.SendToBack();
            dataGridViewOrders.BringToFront();

            // Add content panel to main layout
            pnlMain.Controls.Add(pnlContent);
            if (pnlHeader != null) pnlHeader.SendToBack();
            pnlContent.BringToFront();

            // Sorting
            dataGridViewOrders.ColumnHeaderMouseClick += (s, e) =>
            {
                var col = dataGridViewOrders.Columns[e.ColumnIndex];
                if (!string.IsNullOrEmpty(col.DataPropertyName))
                {
                    if (sortColumn == col.DataPropertyName) sortAscending = !sortAscending;
                    else { sortColumn = col.DataPropertyName; sortAscending = true; }
                    ApplyFilters();
                }
            };
        }

        private void ApplyFilters()
        {
            var query = allOrders.AsEnumerable();

            foreach (var kvp in filterBoxes)
            {
                string filterText = kvp.Value.Text.Trim().ToLower();
                if (!string.IsNullOrEmpty(filterText))
                {
                    var prop = typeof(CustomerOrder).GetProperty(kvp.Key);
                    if (prop != null)
                    {
                        query = query.Where(o => 
                        {
                            var val = prop.GetValue(o, null);
                            return val != null && val.ToString().ToLower().Contains(filterText);
                        });
                    }
                }
            }

            if (!string.IsNullOrEmpty(sortColumn))
            {
                var prop = typeof(CustomerOrder).GetProperty(sortColumn);
                if (prop != null)
                {
                    if (sortAscending) query = query.OrderBy(o => prop.GetValue(o, null));
                    else query = query.OrderByDescending(o => prop.GetValue(o, null));
                }
            }

            filteredOrders = query.ToList();
            currentPage = 1;
            RefreshGrid();
        }

        private void RefreshGrid()
        {
            isUpdatingGrid = true;
            pnlFilters.SuspendLayout();

            int totalPages = Math.Max(1, (int)Math.Ceiling(filteredOrders.Count / (double)pageSize));
            if (currentPage > totalPages) currentPage = totalPages;

            lblPageInfo.Text = $"Page {currentPage} of {totalPages} ({filteredOrders.Count} items)";
            btnPrevPage.Enabled = currentPage > 1;
            btnNextPage.Enabled = currentPage < totalPages;

            var pageData = filteredOrders.Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();

            dataGridViewOrders.DataSource = null;
            dataGridViewOrders.DataSource = pageData;

            pnlFilters.ResumeLayout(true);
            isUpdatingGrid = false;
        }

        private void LoadLogo()
        {
            try
            {
                string logoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "logo.png");
                if (File.Exists(logoPath))
                {
                    using (var ms = new MemoryStream(File.ReadAllBytes(logoPath)))
                    {
                        var bmp = new Bitmap(Image.FromStream(ms));
                        
                        // Change black pixels to white to make it visible on dark theme
                        for (int y = 0; y < bmp.Height; y++)
                        {
                            for (int x = 0; x < bmp.Width; x++)
                            {
                                Color p = bmp.GetPixel(x, y);
                                // If the pixel is dark/black (R, G, and B are low)
                                if (p.A > 0 && p.R < 50 && p.G < 50 && p.B < 50)
                                {
                                    bmp.SetPixel(x, y, Color.FromArgb(p.A, 255, 255, 255));
                                }
                            }
                        }

                        picLoginLogo.Image = bmp;
                        picMainLogo.Image = bmp;
                        
                        // Set the Form's window icon
                        IntPtr hicon = bmp.GetHicon();
                        this.Icon = System.Drawing.Icon.FromHandle(hicon);
                    }
                }
            }
            catch (Exception ex)
            {
                // Ignore if logo cannot be loaded
                Console.WriteLine("Could not load logo: " + ex.Message);
            }
        }

        private void LoadTheme()
        {
            try
            {
                string bgPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "sports_bg.png");
                if (File.Exists(bgPath))
                {
                    using (var ms = new MemoryStream(File.ReadAllBytes(bgPath)))
                    {
                        pnlLogin.BackgroundImage = Image.FromStream(ms);
                        pnlLogin.BackgroundImageLayout = ImageLayout.Stretch;
                    }
                }
                
                Label lblCopyright = new Label
                {
                    Text = "© " + DateTime.Now.Year + " Captain. All rights reserved.",
                    ForeColor = Color.LightGray,
                    BackColor = Color.Transparent,
                    Dock = DockStyle.Bottom,
                    TextAlign = ContentAlignment.MiddleCenter,
                    Height = 40,
                    Font = new Font("Segoe UI", 9)
                };
                pnlLogin.Controls.Add(lblCopyright);
            }
            catch { }

            dataGridViewOrders.EnableHeadersVisualStyles = false;
            dataGridViewOrders.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.DisableResizing;
            dataGridViewOrders.ColumnHeadersHeight = 45;
            dataGridViewOrders.ColumnHeadersDefaultCellStyle.BackColor = Color.FromArgb(241, 245, 249);
            dataGridViewOrders.ColumnHeadersDefaultCellStyle.SelectionBackColor = Color.FromArgb(241, 245, 249);
            dataGridViewOrders.ColumnHeadersDefaultCellStyle.ForeColor = Color.FromArgb(15, 23, 42);
            dataGridViewOrders.ColumnHeadersDefaultCellStyle.SelectionForeColor = Color.FromArgb(15, 23, 42);
            dataGridViewOrders.ColumnHeadersDefaultCellStyle.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            dataGridViewOrders.ColumnHeadersDefaultCellStyle.Padding = new Padding(10, 10, 10, 10);
            dataGridViewOrders.ColumnHeadersDefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleCenter;
            dataGridViewOrders.ColumnHeadersBorderStyle = DataGridViewHeaderBorderStyle.Single;
            
            dataGridViewOrders.DefaultCellStyle.BackColor = Color.White;
            dataGridViewOrders.DefaultCellStyle.ForeColor = Color.FromArgb(51, 65, 85);
            dataGridViewOrders.DefaultCellStyle.Font = new Font("Segoe UI", 10, FontStyle.Regular);
            dataGridViewOrders.DefaultCellStyle.SelectionBackColor = Color.FromArgb(241, 245, 249);
            dataGridViewOrders.DefaultCellStyle.SelectionForeColor = Color.FromArgb(15, 23, 42);
            dataGridViewOrders.DefaultCellStyle.Padding = new Padding(10, 5, 10, 5);
            dataGridViewOrders.DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleCenter;
            
            dataGridViewOrders.AlternatingRowsDefaultCellStyle.BackColor = Color.FromArgb(248, 250, 252);
            
            dataGridViewOrders.RowHeadersVisible = false;
            dataGridViewOrders.GridColor = Color.FromArgb(226, 232, 240);
            dataGridViewOrders.RowTemplate.Height = 50;
            dataGridViewOrders.CellBorderStyle = DataGridViewCellBorderStyle.SingleHorizontal;
            dataGridViewOrders.BorderStyle = BorderStyle.None;
            dataGridViewOrders.BackgroundColor = Color.White;
            dataGridViewOrders.GridColor = Color.FromArgb(226, 232, 240);
            
            // Round all action buttons
            RoundButton(btnSearch, 6);
            RoundButton(btnFetchOrders, 6);
            RoundButton(btnPrintLabel, 6);
            RoundButton(btnClearList, 6);
            RoundButton(btnLogin, 6);
            RoundButton(btnGoogleLogin, 6);
            if (btnPrevPage != null) RoundButton(btnPrevPage, 6);
            if (btnNextPage != null) RoundButton(btnNextPage, 6);
        }

        private void RoundButton(Button btn, int radius = 6)
        {
            if (btn == null) return;
            btn.FlatStyle = FlatStyle.Flat;
            btn.FlatAppearance.BorderSize = 0;
            
            Action applyRegion = () =>
            {
                if (btn.Width == 0 || btn.Height == 0) return;
                var path = new System.Drawing.Drawing2D.GraphicsPath();
                int r2 = radius * 2;
                path.AddArc(0, 0, r2, r2, 180, 90);
                path.AddArc(btn.Width - r2, 0, r2, r2, 270, 90);
                path.AddArc(btn.Width - r2, btn.Height - r2, r2, r2, 0, 90);
                path.AddArc(0, btn.Height - r2, r2, r2, 90, 90);
                path.CloseAllFigures();
                var oldRegion = btn.Region;
                btn.Region = new Region(path);
                oldRegion?.Dispose();
            };

            btn.Resize += (s, e) => applyRegion();
            applyRegion();
        }

        private async void btnLogin_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtUsername.Text) || string.IsNullOrWhiteSpace(txtPassword.Text))
            {
                CustomMessageBox.Show("Please enter both username and password.", "Warning", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            btnLogin.Enabled = false;
            btnLogin.Text = "Logging in...";

            try
            {
                using (var client = new HttpClient())
                {
                    var url = "http://localhost:5133/api/Login/getlogin";
                    var loginRequest = new LoginRequest
                    {
                        username = txtUsername.Text,
                        password = txtPassword.Text
                    };

                    var jsonContent = new StringContent(JsonConvert.SerializeObject(loginRequest), Encoding.UTF8, "application/json");
                    var response = await client.PostAsync(url, jsonContent);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseString = await response.Content.ReadAsStringAsync();
                        var creds = JsonConvert.DeserializeObject<Credentials>(responseString);

                        if (!string.IsNullOrEmpty(creds.token))
                        {
                            Program.JwtToken = creds.token;
                            
                            // Switch to Main View
                            pnlLogin.Visible = false;
                            pnlMain.Visible = true;

                            await FetchConstantsAsync();
                        }
                        else
                        {
                            CustomMessageBox.Show(creds.message ?? "Login failed. No token received.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        }
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    {
                        var responseString = await response.Content.ReadAsStringAsync();
                        var creds = JsonConvert.DeserializeObject<Credentials>(responseString);
                        CustomMessageBox.Show(creds?.message ?? "Invalid credentials.", "Unauthorized", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                    else
                    {
                        CustomMessageBox.Show($"Login failed. Server returned {response.StatusCode}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
            catch (Exception ex)
            {
                CustomMessageBox.Show($"Connection error: {ex.Message}", "Exception", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                btnLogin.Enabled = true;
                btnLogin.Text = "Log In";
            }
        }

        private async void btnGoogleLogin_Click(object sender, EventArgs e)
        {
            btnGoogleLogin.Enabled = false;
            btnGoogleLogin.Text = "Waiting for browser...";

            try
            {
                var helper = new GoogleAuthHelper();
                string idToken = await helper.GetGoogleIdTokenAsync();

                if (!string.IsNullOrEmpty(idToken))
                {
                    btnGoogleLogin.Text = "Authenticating...";

                    using (var client = new HttpClient())
                    {
                        var url = "https://localhost:7299/api/Login/google-login";
                        var requestBody = new { idToken = idToken };
                        var jsonContent = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");

                        var response = await client.PostAsync(url, jsonContent);

                        if (response.IsSuccessStatusCode)
                        {
                            var responseString = await response.Content.ReadAsStringAsync();
                            var creds = JsonConvert.DeserializeObject<Credentials>(responseString);

                            if (!string.IsNullOrEmpty(creds.token))
                            {
                                Program.JwtToken = creds.token;
                                
                                pnlLogin.Visible = false;
                                pnlMain.Visible = true;

                                await FetchConstantsAsync();
                            }
                            else
                            {
                                CustomMessageBox.Show(creds.message ?? "Google Login failed. No token received.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            }
                        }
                        else
                        {
                            var responseString = await response.Content.ReadAsStringAsync();
                            CustomMessageBox.Show($"Google Login failed.\nStatus: {response.StatusCode}\nMessage: {responseString}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                CustomMessageBox.Show($"Google connection error: {ex.Message}", "Exception", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                btnGoogleLogin.Enabled = true;
                btnGoogleLogin.Text = "Sign in with Google";
            }
        }

        private async Task FetchConstantsAsync()
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (!string.IsNullOrEmpty(Program.JwtToken))
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Program.JwtToken);
                    }
                    var url = "https://localhost:7299/api/ConstantValue/getConstantValues";
                    var content = new StringContent("", Encoding.UTF8, "application/json");
                    var response = await client.PostAsync(url, content);
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        var constants = JsonConvert.DeserializeObject<List<ConstantValue>>(json);
                        appConstants.Clear();
                        if (constants != null)
                        {
                            foreach (var c in constants)
                            {
                                if (!string.IsNullOrEmpty(c.cv_name))
                                    appConstants[c.cv_name] = c.cv_value ?? "";
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Proceed without constants if error occurs
            }
        }

        private async void btnFetchOrders_Click(object sender, EventArgs e)
        {
            btnFetchOrders.Enabled = false;
            txtSearch.Text = ""; // Clear search to fetch all active orders
            await LoadOrdersAsync(append: false);
            btnFetchOrders.Enabled = true;
        }

        private async void btnSearch_Click(object sender, EventArgs e)
        {
            btnSearch.Enabled = false;
            await LoadOrdersAsync(append: true);
            btnSearch.Enabled = true;
        }

        private void btnClearList_Click(object sender, EventArgs e)
        {
            if (allOrders != null)
            {
                allOrders.Clear();
                ApplyFilters();
            }
        }

        private async Task LoadOrdersAsync(bool append = false)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (!string.IsNullOrEmpty(Program.JwtToken))
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Program.JwtToken);
                    }

                    var url = "https://localhost:7299/api/CustomerOrder/getCustomerOrders";
                    
                    var requestParams = new RequestParams
                    {
                        completedYn = "A", // 'A' for All Orders (including created shipments)
                        startDate = "",
                        endDate = ""
                    };

                    string keyword = txtSearch.Text.Trim();
                    if (!string.IsNullOrEmpty(keyword))
                    {
                        // If the search keyword is a number, send it as ID.
                        if (int.TryParse(keyword, out int orderId))
                        {
                            requestParams.id = orderId;
                        }
                        else
                        {
                            // Otherwise send as name (or phone based on your API)
                            requestParams.name = keyword;
                        }
                    }

                    var jsonContent = new StringContent(JsonConvert.SerializeObject(requestParams), Encoding.UTF8, "application/json");
                    var response = await client.PostAsync(url, jsonContent);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseString = await response.Content.ReadAsStringAsync();
                        var fetchedOrders = JsonConvert.DeserializeObject<List<CustomerOrder>>(responseString) ?? new List<CustomerOrder>();

                        if (fetchedOrders.Count == 0 && !string.IsNullOrEmpty(keyword))
                        {
                            CustomMessageBox.Show($"No active order found matching '{keyword}'.", "Not Found", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        }

                        if (append)
                        {
                            if (allOrders == null) allOrders = new List<CustomerOrder>();
                            foreach (var newOrder in fetchedOrders)
                            {
                                if (!allOrders.Any(o => o.co_id == newOrder.co_id))
                                {
                                    allOrders.Add(newOrder);
                                }
                            }
                        }
                        else
                        {
                            allOrders = fetchedOrders;
                        }

                        ApplyFilters();
                    }
                    else
                    {
                        CustomMessageBox.Show($"Failed to fetch orders. Status: {response.StatusCode}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
            catch (Exception ex)
            {
                CustomMessageBox.Show($"Error: {ex.Message}", "Exception", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void DataGridViewOrders_DataBindingComplete(object sender, DataGridViewBindingCompleteEventArgs e)
        {
            FormatGrid();
        }

        private void DataGridViewOrders_CellFormatting(object sender, DataGridViewCellFormattingEventArgs e)
        {
            if (e.RowIndex >= 0 && e.ColumnIndex >= 0)
            {
                var colName = dataGridViewOrders.Columns[e.ColumnIndex].Name;
                if (colName == "btnDetails")
                {
                    e.CellStyle.BackColor = Color.FromArgb(14, 165, 233);
                    e.CellStyle.SelectionBackColor = Color.FromArgb(14, 165, 233);
                    e.CellStyle.ForeColor = Color.White;
                    e.CellStyle.SelectionForeColor = Color.White;
                }
                else if (colName == "btnRemove")
                {
                    e.CellStyle.BackColor = Color.FromArgb(239, 68, 68);
                    e.CellStyle.SelectionBackColor = Color.FromArgb(239, 68, 68);
                    e.CellStyle.ForeColor = Color.White;
                    e.CellStyle.SelectionForeColor = Color.White;
                }
                else if (colName == "btnPrintInd")
                {
                    e.CellStyle.BackColor = Color.FromArgb(34, 197, 94);
                    e.CellStyle.SelectionBackColor = Color.FromArgb(34, 197, 94);
                    e.CellStyle.ForeColor = Color.White;
                    e.CellStyle.SelectionForeColor = Color.White;
                }
            }
        }

        private void FormatGrid()
        {
            if (dataGridViewOrders.Columns.Count == 0) return;

            // Add Details Button Column if not exists
            if (!dataGridViewOrders.Columns.Contains("btnDetails"))
            {
                var btnCol = new DataGridViewButtonColumn();
                btnCol.Name = "btnDetails";
                btnCol.HeaderText = "";
                btnCol.Text = "👁️ Details"; 
                btnCol.UseColumnTextForButtonValue = true;
                btnCol.DefaultCellStyle.Font = new Font("Segoe UI", 9, FontStyle.Bold);
                btnCol.DefaultCellStyle.BackColor = Color.FromArgb(14, 165, 233);
                btnCol.DefaultCellStyle.ForeColor = Color.White;
                btnCol.DefaultCellStyle.SelectionBackColor = Color.FromArgb(2, 132, 199);
                btnCol.DefaultCellStyle.SelectionForeColor = Color.White;
                btnCol.DefaultCellStyle.Padding = new Padding(6, 6, 6, 6);
                btnCol.FlatStyle = FlatStyle.Flat;
                btnCol.AutoSizeMode = DataGridViewAutoSizeColumnMode.None;
                btnCol.Width = 110;
                dataGridViewOrders.Columns.Add(btnCol);
            }

            // Add Remove Button Column if not exists
            if (!dataGridViewOrders.Columns.Contains("btnRemove"))
            {
                var removeCol = new DataGridViewButtonColumn();
                removeCol.Name = "btnRemove";
                removeCol.HeaderText = ""; 
                removeCol.Text = "❌ Remove"; 
                removeCol.UseColumnTextForButtonValue = true;
                removeCol.DefaultCellStyle.Font = new Font("Segoe UI", 9, FontStyle.Bold);
                removeCol.DefaultCellStyle.BackColor = Color.FromArgb(239, 68, 68);
                removeCol.DefaultCellStyle.ForeColor = Color.White;
                removeCol.DefaultCellStyle.SelectionBackColor = Color.FromArgb(220, 38, 38);
                removeCol.DefaultCellStyle.SelectionForeColor = Color.White;
                removeCol.DefaultCellStyle.Padding = new Padding(6, 6, 6, 6);
                removeCol.FlatStyle = FlatStyle.Flat;
                removeCol.AutoSizeMode = DataGridViewAutoSizeColumnMode.None;
                removeCol.Width = 110;
                dataGridViewOrders.Columns.Add(removeCol);
            }

            // Add Individual Print Button Column if not exists
            if (!dataGridViewOrders.Columns.Contains("btnPrintInd"))
            {
                var printCol = new DataGridViewButtonColumn();
                printCol.Name = "btnPrintInd";
                printCol.HeaderText = ""; 
                printCol.Text = "🖨️ Print"; 
                printCol.UseColumnTextForButtonValue = true;
                printCol.DefaultCellStyle.Font = new Font("Segoe UI", 9, FontStyle.Bold);
                printCol.DefaultCellStyle.BackColor = Color.FromArgb(34, 197, 94);
                printCol.DefaultCellStyle.ForeColor = Color.White;
                printCol.DefaultCellStyle.SelectionBackColor = Color.FromArgb(22, 163, 74);
                printCol.DefaultCellStyle.SelectionForeColor = Color.White;
                printCol.DefaultCellStyle.Padding = new Padding(6, 6, 6, 6);
                printCol.FlatStyle = FlatStyle.Flat;
                printCol.AutoSizeMode = DataGridViewAutoSizeColumnMode.None;
                printCol.Width = 100;
                dataGridViewOrders.Columns.Add(printCol);
            }

            // Hide all columns first
            foreach (DataGridViewColumn col in dataGridViewOrders.Columns)
            {
                if (col.Name != "btnDetails" && col.Name != "btnRemove" && col.Name != "btnPrintInd")
                {
                    col.Visible = false;
                }
            }

            // Show and rename only relevant columns
            if (dataGridViewOrders.Columns.Contains("co_id"))
            {
                dataGridViewOrders.Columns["co_id"].Visible = true;
                dataGridViewOrders.Columns["co_id"].HeaderText = "Order ID";
                dataGridViewOrders.Columns["co_id"].DisplayIndex = 0;
            }
            if (dataGridViewOrders.Columns.Contains("co_customer_name"))
            {
                dataGridViewOrders.Columns["co_customer_name"].Visible = true;
                dataGridViewOrders.Columns["co_customer_name"].HeaderText = "Customer";
                dataGridViewOrders.Columns["co_customer_name"].DisplayIndex = 1;
            }
            if (dataGridViewOrders.Columns.Contains("co_customer_phone"))
            {
                dataGridViewOrders.Columns["co_customer_phone"].Visible = true;
                dataGridViewOrders.Columns["co_customer_phone"].HeaderText = "Phone";
                dataGridViewOrders.Columns["co_customer_phone"].DisplayIndex = 2;
            }
            if (dataGridViewOrders.Columns.Contains("co_product_name"))
            {
                dataGridViewOrders.Columns["co_product_name"].Visible = true;
                dataGridViewOrders.Columns["co_product_name"].HeaderText = "Product";
                dataGridViewOrders.Columns["co_product_name"].DisplayIndex = 3;
            }
            if (dataGridViewOrders.Columns.Contains("co_status_name"))
            {
                dataGridViewOrders.Columns["co_status_name"].Visible = true;
                dataGridViewOrders.Columns["co_status_name"].HeaderText = "Status";
                dataGridViewOrders.Columns["co_status_name"].DisplayIndex = 4;
            }
            if (dataGridViewOrders.Columns.Contains("co_waybill"))
            {
                dataGridViewOrders.Columns["co_waybill"].Visible = true;
                dataGridViewOrders.Columns["co_waybill"].HeaderText = "Waybill";
                dataGridViewOrders.Columns["co_waybill"].DisplayIndex = 5;
            }

            dataGridViewOrders.Columns["btnDetails"].DisplayIndex = 6;
            dataGridViewOrders.Columns["btnPrintInd"].DisplayIndex = 7;
            dataGridViewOrders.Columns["btnRemove"].DisplayIndex = 8;
        }

        private void DataGridViewOrders_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0 && e.ColumnIndex >= 0)
            {
                var order = dataGridViewOrders.Rows[e.RowIndex].DataBoundItem as CustomerOrder;
                if (order == null) return;

                if (dataGridViewOrders.Columns[e.ColumnIndex].Name == "btnDetails")
                {
                    string details = $"--- ORDER DETAILS ---\n\n" +
                                     $"Order ID: {order.co_id}\n" +
                                     $"Date: {order.co_cre_date}\n" +
                                     $"Status: {order.co_status_name}\n\n" +
                                     $"--- CUSTOMER INFO ---\n" +
                                     $"Name: {order.co_customer_name}\n" +
                                     $"Phone: {order.co_customer_phone}\n" +
                                     $"Email: {order.co_customer_email}\n" +
                                     $"Address: {order.co_c_address_details}\n\n" +
                                     $"--- PRODUCT INFO ---\n" +
                                     $"Product: {order.co_product_name}\n" +
                                     $"Size: {order.co_size_name}\n" +
                                     $"Color: {order.co_color_name}\n" +
                                     $"Quantity: {order.co_qty}\n" +
                                     $"Unit Price: {order.co_unit_price}\n" +
                                     $"Net Amount: {order.co_net_amount}";

                    CustomMessageBox.Show(details, $"Order #{order.co_id} Details", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                else if (dataGridViewOrders.Columns[e.ColumnIndex].Name == "btnRemove")
                {
                    if (CustomMessageBox.Show($"Are you sure you want to remove Order #{order.co_id} from this list?", "Confirm Remove", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
                    {
                        allOrders.Remove(order);
                        ApplyFilters();
                    }
                }
                else if (dataGridViewOrders.Columns[e.ColumnIndex].Name == "btnPrintInd")
                {
                    if (PrintSingleOrder(order))
                    {
                        allOrders.Remove(order);
                        ApplyFilters();
                    }
                }
            }
        }

        private bool PrintSingleOrder(CustomerOrder order)
        {
            if (order == null) return false;

            // If order has a Delhivery Waybill (Created Shipment), open the 4x6 Barcode Shipping Label in a new browser tab
            if (!string.IsNullOrWhiteSpace(order.co_waybill))
            {
                try
                {
                    string labelUrl = $"https://localhost:7299/api/Delhivery/generateShippingLabel/{order.co_waybill.Trim()}?pdf_size=4R";
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = labelUrl,
                        UseShellExecute = true
                    });
                    return true;
                }
                catch (Exception ex)
                {
                    CustomMessageBox.Show("Failed to open shipping label: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return false;
                }
            }

            try
            {
                string FilePath = @"C:\PRINT\";
                if (!Directory.Exists(FilePath)) Directory.CreateDirectory(FilePath);

                File.WriteAllLines(@"C:\PRINT\print.txt", new string[] { "" });

                string[] format = File.ReadAllLines(@"C:\PRINT\CustomerOrderFormat.txt");

                for (int count = 0; count < format.Length; count++)
                {
                    // Dynamic API configuration replacements FIRST (prevents substring conflicts like COMPANYADDRESS vs ADDRESS)
                    format[count] = format[count].Replace("COMPANYNAME", appConstants.ContainsKey("Company Name") ? appConstants["Company Name"] : "Captain");
                    format[count] = format[count].Replace("COMPANYADDRESS", appConstants.ContainsKey("Company Address") ? appConstants["Company Address"].Replace(",", ", ") : "United Arab Emirates");
                    format[count] = format[count].Replace("GSTNUMBER", appConstants.ContainsKey("Company Tax Reg Number") ? appConstants["Company Tax Reg Number"] : "N/A");

                    format[count] = format[count].Replace("ORDERID", order.co_id.ToString());
                    format[count] = format[count].Replace("CUSTOMERNAME", order.co_customer_name ?? "");
                    format[count] = format[count].Replace("PHONE", order.co_customer_phone ?? "");
                    format[count] = format[count].Replace("ADDRESS", order.co_c_address_details ?? "");
                    format[count] = format[count].Replace("BARCODEPRINT", order.co_id.ToString("D8"));
                    format[count] = format[count].Replace("BARCODE", order.co_id.ToString("D8"));
                    format[count] = format[count].Replace("QUANTITY", order.co_qty.ToString());
                    
                    // New order details replacements
                    string currency = appConstants.ContainsKey("Default Currency") ? appConstants["Default Currency"] : "";
                    if (currency.Contains("₹")) currency = currency.Replace("₹", "Rs.");
                    currency = currency + " ";
                    format[count] = format[count].Replace("PRODUCTINFO", $"{order.co_product_name} (Size: {order.co_size_name}, Color: {order.co_color_name})");
                    format[count] = format[count].Replace("GSTPERC", order.co_gst_perc?.ToString("0.##") ?? "0");
                    format[count] = format[count].Replace("TAXAMOUNT", $"{currency}{order.co_gst_amount?.ToString("0.00") ?? "0.00"}");
                    format[count] = format[count].Replace("TOTALAMOUNT", $"{currency}{order.co_net_amount?.ToString("0.00") ?? "0.00"}");
                }

                File.AppendAllLines(@"C:\PRINT\print.txt", format);
                string printerAddress = File.ReadAllText(@"C:\PRINT\printerAddress.txt");
                File.Copy(@"C:\PRINT\print.txt", printerAddress, true);

                CustomMessageBox.Show($"Sent Order #{order.co_id} to printer.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return true;
            }
            catch (Exception ex)
            {
                CustomMessageBox.Show("Printing failed!\n\n" + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return false;
            }
        }

        private void btnPrintLabel_Click(object sender, EventArgs e)
        {
            if (dataGridViewOrders.Rows.Count == 0)
            {
                CustomMessageBox.Show("There are no orders in the list to print.", "Warning", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            try
            {
                int waybillCount = 0;
                int localCount = 0;

                foreach (DataGridViewRow row in dataGridViewOrders.Rows)
                {
                    var order = row.DataBoundItem as CustomerOrder;
                    if (order == null) continue;

                    if (!string.IsNullOrWhiteSpace(order.co_waybill))
                    {
                        string labelUrl = $"https://localhost:7299/api/Delhivery/generateShippingLabel/{order.co_waybill.Trim()}?pdf_size=4R";
                        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                        {
                            FileName = labelUrl,
                            UseShellExecute = true
                        });
                        waybillCount++;
                    }
                    else
                    {
                        if (PrintSingleOrder(order))
                        {
                            localCount++;
                        }
                    }
                }

                if (waybillCount > 0)
                {
                    CustomMessageBox.Show($"Opened {waybillCount} shipping label(s) in new browser tab(s).", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }

                allOrders?.Clear();
                ApplyFilters();
            }
            catch (Exception ex)
            {
                CustomMessageBox.Show("Printing failed!\n\n" + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        private void pnlLogin_Paint(object sender, PaintEventArgs e)
        {
            // Optional: Draw overlay or additional elements if needed
        }

        private void pnlLoginBox_Paint(object sender, PaintEventArgs e)
        {
            e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            DrawRoundedTextBoxBorder(e.Graphics, txtUsername);
            DrawRoundedTextBoxBorder(e.Graphics, txtPassword);
        }

        private void pnlHeader_Paint(object sender, PaintEventArgs e)
        {
            e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            // Removed DrawRoundedTextBoxBorder to eliminate double-box effect
        }

        private void DrawRoundedTextBoxBorder(Graphics g, TextBox txt)
        {
            int radius = 8;
            // Expand slightly around the textbox to act as a border padding
            Rectangle rect = new Rectangle(txt.Left - 5, txt.Top - 5, txt.Width + 10, txt.Height + 10);
            
            using (System.Drawing.Drawing2D.GraphicsPath path = new System.Drawing.Drawing2D.GraphicsPath())
            {
                path.AddArc(rect.X, rect.Y, radius * 2, radius * 2, 180, 90);
                path.AddArc(rect.Right - radius * 2, rect.Y, radius * 2, radius * 2, 270, 90);
                path.AddArc(rect.Right - radius * 2, rect.Bottom - radius * 2, radius * 2, radius * 2, 0, 90);
                path.AddArc(rect.X, rect.Bottom - radius * 2, radius * 2, radius * 2, 90, 90);
                path.CloseFigure();

                // Fill the path with the textbox's back color
                using (SolidBrush brush = new SolidBrush(txt.BackColor))
                {
                    g.FillPath(brush, path);
                }

                // Draw the rounded border line
                using (Pen pen = new Pen(Color.FromArgb(100, 100, 100), 1f))
                {
                    g.DrawPath(pen, path);
                }
            }
        }
    }
}
