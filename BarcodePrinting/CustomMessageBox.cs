using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace BarcodePrinting
{
    public static class CustomMessageBox
    {
        public static DialogResult Show(string message, string title = "Notification", MessageBoxButtons buttons = MessageBoxButtons.OK, MessageBoxIcon icon = MessageBoxIcon.None)
        {
            using (var form = new Form())
            {
                form.FormBorderStyle = FormBorderStyle.None;
                form.BackColor = Color.FromArgb(24, 24, 27); // Zinc 900
                form.StartPosition = FormStartPosition.CenterParent;
                form.TopMost = true;

                // Calculate required height dynamically
                int textHeight = TextRenderer.MeasureText(message, new Font("Segoe UI", 11, FontStyle.Regular), new Size(410, 0), TextFormatFlags.WordBreak).Height;
                int totalHeight = Math.Max(200, textHeight + 150); // Title + Buttons + Padding = ~150
                form.Size = new Size(450, totalHeight);

                // Border Color based on icon
                Color borderColor = Color.FromArgb(14, 165, 233); // Sky Blue default
                if (icon == MessageBoxIcon.Error) borderColor = Color.FromArgb(239, 68, 68); // Red
                else if (icon == MessageBoxIcon.Warning) borderColor = Color.FromArgb(245, 158, 11); // Amber
                else if (icon == MessageBoxIcon.Question) borderColor = Color.FromArgb(168, 85, 247); // Purple
                else if (icon == MessageBoxIcon.Information) borderColor = Color.FromArgb(34, 197, 94); // Green

                // Title Panel
                var pnlTitle = new Panel { Dock = DockStyle.Top, Height = 40, BackColor = Color.FromArgb(9, 9, 11) }; // Zinc 950
                var lblTitle = new Label { 
                    Text = title, 
                    ForeColor = Color.White, 
                    Font = new Font("Segoe UI", 11, FontStyle.Bold), 
                    Dock = DockStyle.Left, 
                    AutoSize = true, 
                    Padding = new Padding(15, 10, 0, 0) 
                };
                var btnClose = new Button { 
                    Text = "✕", 
                    ForeColor = Color.Gray, 
                    Dock = DockStyle.Right, 
                    FlatStyle = FlatStyle.Flat, 
                    Width = 40, 
                    Cursor = Cursors.Hand 
                };
                btnClose.FlatAppearance.BorderSize = 0;
                btnClose.FlatAppearance.MouseOverBackColor = Color.FromArgb(239, 68, 68);
                btnClose.Click += (s, e) => { form.DialogResult = DialogResult.Cancel; form.Close(); };
                pnlTitle.Controls.Add(lblTitle);
                pnlTitle.Controls.Add(btnClose);
                form.Controls.Add(pnlTitle);

                // Message Panel
                var pnlMessage = new Panel { Dock = DockStyle.Fill };
                var lblMessage = new Label
                {
                    Text = message,
                    ForeColor = Color.FromArgb(228, 228, 231), // Zinc 200
                    Font = new Font("Segoe UI", 11, FontStyle.Regular),
                    Dock = DockStyle.Fill,
                    TextAlign = message.Contains("\n") ? ContentAlignment.MiddleLeft : ContentAlignment.MiddleCenter,
                    Padding = new Padding(20)
                };
                pnlMessage.Controls.Add(lblMessage);
                form.Controls.Add(pnlMessage);

                // Buttons Panel
                var pnlButtons = new Panel { Dock = DockStyle.Bottom, Height = 60, BackColor = Color.FromArgb(24, 24, 27) };
                form.Controls.Add(pnlButtons);

                Button btnOk = null, btnYes = null, btnNo = null;

                if (buttons == MessageBoxButtons.OK || buttons == MessageBoxButtons.OKCancel)
                {
                    btnOk = CreateButton("OK", borderColor);
                    btnOk.Click += (s, e) => { form.DialogResult = DialogResult.OK; form.Close(); };
                    pnlButtons.Controls.Add(btnOk);
                }
                else if (buttons == MessageBoxButtons.YesNo)
                {
                    btnNo = CreateButton("No", Color.FromArgb(63, 63, 70)); // Zinc 700
                    btnNo.Click += (s, e) => { form.DialogResult = DialogResult.No; form.Close(); };
                    
                    btnYes = CreateButton("Yes", borderColor);
                    btnYes.Click += (s, e) => { form.DialogResult = DialogResult.Yes; form.Close(); };
                    
                    pnlButtons.Controls.Add(btnNo);
                    pnlButtons.Controls.Add(btnYes);
                }

                form.Load += (s, e) =>
                {
                    if (btnOk != null)
                    {
                        btnOk.Location = new Point((form.Width - btnOk.Width) / 2, 10);
                    }
                    else if (btnYes != null && btnNo != null)
                    {
                        int totalWidth = btnYes.Width + btnNo.Width + 10;
                        int startX = (form.Width - totalWidth) / 2;
                        btnYes.Location = new Point(startX, 10);
                        btnNo.Location = new Point(startX + btnYes.Width + 10, 10);
                    }
                };

                // Enable dragging
                bool dragging = false;
                Point dragCursorPoint = Point.Empty;
                Point dragFormPoint = Point.Empty;
                pnlTitle.MouseDown += (s, e) => { dragging = true; dragCursorPoint = Cursor.Position; dragFormPoint = form.Location; };
                pnlTitle.MouseMove += (s, e) => { if (dragging) { Point dif = Point.Subtract(Cursor.Position, new Size(dragCursorPoint)); form.Location = Point.Add(dragFormPoint, new Size(dif)); } };
                pnlTitle.MouseUp += (s, e) => { dragging = false; };
                lblTitle.MouseDown += (s, e) => { dragging = true; dragCursorPoint = Cursor.Position; dragFormPoint = form.Location; };
                lblTitle.MouseMove += (s, e) => { if (dragging) { Point dif = Point.Subtract(Cursor.Position, new Size(dragCursorPoint)); form.Location = Point.Add(dragFormPoint, new Size(dif)); } };
                lblTitle.MouseUp += (s, e) => { dragging = false; };

                // Paint border
                form.Paint += (s, e) =>
                {
                    ControlPaint.DrawBorder(e.Graphics, form.ClientRectangle, borderColor, 2, ButtonBorderStyle.Solid, borderColor, 2, ButtonBorderStyle.Solid, borderColor, 2, ButtonBorderStyle.Solid, borderColor, 2, ButtonBorderStyle.Solid);
                };

                return form.ShowDialog();
            }
        }

        private static Button CreateButton(string text, Color backColor)
        {
            var btn = new Button
            {
                Text = text,
                BackColor = backColor,
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 10, FontStyle.Bold),
                Size = new Size(100, 35),
                Cursor = Cursors.Hand
            };
            btn.FlatAppearance.BorderSize = 0;
            return btn;
        }
    }
}
