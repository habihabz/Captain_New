using System;
using System.Drawing;
using System.IO;
using System.Text;

class Program
{
    static void Main(string[] args)
    {
        string imagePath = args[0];
        Bitmap original = new Bitmap(imagePath);
        
        int targetWidth = 104;
        int targetHeight = 104;
        Bitmap bmp = new Bitmap(original, new Size(targetWidth, targetHeight));
        
        int widthBytes = (bmp.Width + 7) / 8;
        int totalBytes = widthBytes * bmp.Height;
        
        StringBuilder hex = new StringBuilder();
        
        for (int y = 0; y < bmp.Height; y++)
        {
            for (int x = 0; x < widthBytes; x++)
            {
                byte b = 0;
                for (int i = 0; i < 8; i++)
                {
                    int px = x * 8 + i;
                    if (px < bmp.Width)
                    {
                        Color c = bmp.GetPixel(px, y);
                        // The logo is dark/black on transparent. 
                        bool isBlack = c.A > 128 && (c.R + c.G + c.B) < 600;
                        if (isBlack)
                        {
                            b |= (byte)(1 << (7 - i));
                        }
                    }
                }
                hex.Append(b.ToString("X2"));
            }
            hex.AppendLine();
        }
        
        string zpl = $"^FO50,50^GFA,{totalBytes},{totalBytes},{widthBytes},\n{hex.ToString()}^FS";
        File.WriteAllText(@"C:\PRINT\logo_zpl.txt", zpl);
    }
}
