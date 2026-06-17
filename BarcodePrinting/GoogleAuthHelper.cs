using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace BarcodePrinting
{
    public class GoogleAuthHelper
    {
        // IMPORTANT: Replace this with your actual Google Client ID for Desktop App
        private string ClientId = "YOUR_GOOGLE_CLIENT_ID_HERE";
        private const string RedirectUri = "http://127.0.0.1:8080/";

        public async Task<string> GetGoogleIdTokenAsync()
        {
            if (ClientId == "YOUR_GOOGLE_CLIENT_ID_HERE")
            {
                System.Windows.Forms.MessageBox.Show("Please configure your Google Client ID in GoogleAuthHelper.cs first!", "Configuration Required", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Warning);
                return null;
            }

            string state = Guid.NewGuid().ToString("N");
            string nonce = Guid.NewGuid().ToString("N");

            // Implicit flow requesting id_token
            string authUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                             $"client_id={ClientId}&" +
                             $"response_type=id_token&" +
                             $"scope=openid%20email%20profile&" +
                             $"redirect_uri={Uri.EscapeDataString(RedirectUri)}&" +
                             $"state={state}&" +
                             $"nonce={nonce}";

            using (var listener = new HttpListener())
            {
                listener.Prefixes.Add(RedirectUri);
                listener.Start();

                // Open system browser
                Process.Start(new ProcessStartInfo
                {
                    FileName = authUrl,
                    UseShellExecute = true
                });

                string idToken = null;

                while (idToken == null)
                {
                    var context = await listener.GetContextAsync();
                    var request = context.Request;
                    var response = context.Response;

                    if (request.HttpMethod == "GET" && request.Url.AbsolutePath == "/")
                    {
                        // Return HTML page to parse the fragment and post it back
                        string html = @"
                            <html>
                            <head><title>Google Login Redirect</title></head>
                            <body>
                                <h2>Processing login, please wait...</h2>
                                <script>
                                    var hash = window.location.hash;
                                    if (hash) {
                                        var params = new URLSearchParams(hash.substring(1));
                                        var idToken = params.get('id_token');
                                        var state = params.get('state');
                                        
                                        fetch('/token', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                            body: 'id_token=' + encodeURIComponent(idToken) + '&state=' + encodeURIComponent(state)
                                        }).then(() => {
                                            document.body.innerHTML = '<h2>Login successful! You may close this window.</h2>';
                                        }).catch(() => {
                                            document.body.innerHTML = '<h2>Failed to process token.</h2>';
                                        });
                                    } else {
                                        document.body.innerHTML = '<h2>No token found. Did you cancel?</h2>';
                                    }
                                </script>
                            </body>
                            </html>";

                        byte[] buffer = Encoding.UTF8.GetBytes(html);
                        response.ContentLength64 = buffer.Length;
                        await response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
                        response.OutputStream.Close();
                    }
                    else if (request.HttpMethod == "POST" && request.Url.AbsolutePath == "/token")
                    {
                        using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
                        {
                            string body = await reader.ReadToEndAsync();
                            string[] pairs = body.Split('&');
                            string receivedState = null;

                            foreach (var pair in pairs)
                            {
                                var kv = pair.Split(new[] { '=' }, 2);
                                if (kv.Length == 2)
                                {
                                    string key = Uri.UnescapeDataString(kv[0]);
                                    string val = Uri.UnescapeDataString(kv[1]);
                                    
                                    if (key == "state") receivedState = val;
                                    if (key == "id_token") idToken = val;
                                }
                            }

                            if (receivedState != state)
                            {
                                idToken = null; // State mismatch, abort
                            }
                        }

                        response.StatusCode = 200;
                        response.OutputStream.Close();
                    }
                    else
                    {
                        response.StatusCode = 404;
                        response.OutputStream.Close();
                    }
                }

                listener.Stop();
                return idToken;
            }
        }
    }
}
