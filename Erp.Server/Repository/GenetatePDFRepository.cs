using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using Erp.Server.Models;
using Erp.Server.Services;
using QuestPDF.Helpers;

namespace Erp.Server.Repository
{
    public class GenetatePDFRepository : IGeneratePDF
    {
        public byte[] Invoice(CustomerOrder o, List<ConstantValue> constantValues)
        {
            // Convert constants to dictionary
            var company = constantValues
                .ToDictionary(x => x.cv_name ?? "", x => x.cv_value ?? "");

            var companyName = company.GetValueOrDefault("Company Name");
            var companyAddress = company.GetValueOrDefault("Company Address");
            var companyPhone = company.GetValueOrDefault("Company Phone");
            var TaxRegNo = company.GetValueOrDefault("Company Tax Reg Number");

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(50);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Verdana"));

                    // ===== HEADER =====
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Height(45).Image("wwwroot/logo/logo.png").FitHeight();
                            col.Item().PaddingTop(10).Text(companyName).Bold().FontSize(15).FontColor(Colors.Grey.Darken4);
                            col.Item().Text(companyAddress).FontSize(8).FontColor(Colors.Grey.Medium);
                            col.Item().Text($"GST : {TaxRegNo}").FontSize(8).FontColor(Colors.Grey.Medium);
                        });

                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text("TAX INVOICE").Bold().FontSize(22).FontColor(Colors.BlueGrey.Darken3);
                            
                            col.Item().PaddingTop(5).Text(t => {
                                t.Span("INVOICE NO:  ").Bold().FontSize(9);
                                t.Span($"CO-{o.co_id}").FontSize(9);
                            });

                            col.Item().Text(t => {
                                t.Span("DATE:  ").Bold().FontSize(9);
                                t.Span($"{o.co_cre_date:dd MMM yyyy}").FontSize(9);
                            });
                        });
                    });

                    // ===== CONTENT =====
                    page.Content().PaddingTop(20).Column(col =>
                    {
                        // BILL TO SECTION
                        col.Item().PaddingTop(10).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().PaddingBottom(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Text("BILL TO").Bold().FontSize(9).FontColor(Colors.Grey.Medium);
                                c.Item().PaddingTop(10).Text(o.co_customer_name).Bold().FontSize(11);
                                c.Item().Text(o.co_customer_phone).FontSize(9).FontColor(Colors.Grey.Darken1);
                                c.Item().MaxWidth(220).Text(o.co_c_address_details).FontSize(9).FontColor(Colors.Grey.Darken1);
                            });

                            row.RelativeItem();
                        });

                        // PRODUCT TABLE
                        col.Item().PaddingTop(40).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn();
                                c.ConstantColumn(60);
                                c.ConstantColumn(90);
                                c.ConstantColumn(90);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Background(Colors.BlueGrey.Darken3).PaddingLeft(10).PaddingVertical(8).Text("ITEM DESCRIPTION").Bold().FontColor(Colors.White).FontSize(9);
                                h.Cell().Background(Colors.BlueGrey.Darken3).PaddingVertical(8).AlignCenter().Text("QTY").Bold().FontColor(Colors.White).FontSize(9);
                                h.Cell().Background(Colors.BlueGrey.Darken3).PaddingVertical(8).AlignRight().Text("PRICE").Bold().FontColor(Colors.White).FontSize(9);
                                h.Cell().Background(Colors.BlueGrey.Darken3).PaddingRight(10).PaddingVertical(8).AlignRight().Text("TOTAL").Bold().FontColor(Colors.White).FontSize(9);
                            });

                            decimal price = o.co_unit_price ?? 0;
                            decimal qty = o.co_qty ?? 0;
                            decimal amount = price * qty;

                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).PaddingLeft(10).PaddingVertical(12).Column(c => {
                                c.Item().Text(o.co_product_name).Bold().FontSize(10);
                                c.Item().Text($"(Size: {o.co_size_name}, Color: {o.co_color_name})").FontSize(8).FontColor(Colors.Grey.Medium);
                            });

                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).PaddingVertical(12).AlignCenter().Text(qty.ToString());
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).PaddingVertical(12).AlignRight().Text($"₹ {price:N2}");
                            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).PaddingRight(10).PaddingVertical(12).AlignRight().Text($"₹ {amount:N2}");
                        });

                        // TOTALS & SIGNATURE
                        col.Item().PaddingTop(25).Row(row =>
                        {
                            row.RelativeItem().AlignBottom().PaddingBottom(5).Column(c =>
                            {
                                c.Item().Text("Authorized Signature").FontSize(8).FontColor(Colors.Grey.Medium);
                                c.Item().PaddingTop(3).Width(150).BorderTop(0.5f).BorderColor(Colors.Grey.Medium);
                            });

                            row.RelativeItem().Column(t =>
                            {
                                if ((o.co_discount_amount ?? 0) > 0)
                                {
                                    t.Item().PaddingVertical(4).Row(r => {
                                        var label = !string.IsNullOrEmpty(o.co_promo_code) 
                                            ? $"Promo Discount ({o.co_promo_code})" 
                                            : $"Discount ({o.co_discount_perc}%)";
                                        
                                        r.RelativeItem().Text(label).FontSize(9).FontColor(Colors.Blue.Medium);
                                        r.ConstantItem(100).AlignRight().Text($"- ₹ {o.co_discount_amount:N2}").FontSize(9).FontColor(Colors.Blue.Medium);
                                    });
                                }

                                t.Item().PaddingVertical(4).Row(r => {
                                    r.RelativeItem().Text($"GST ({o.co_gst_perc}%)").FontSize(9).FontColor(Colors.Grey.Darken1);
                                    r.ConstantItem(100).AlignRight().Text($"₹ {o.co_gst_amount:N2}").FontSize(9).FontColor(Colors.Grey.Darken3);
                                });

                                t.Item().PaddingVertical(4).Row(r => {
                                    r.RelativeItem().Text("Delivery").FontSize(9).FontColor(Colors.Grey.Darken1);
                                    r.ConstantItem(100).AlignRight().Text($"₹ {o.co_delivery_charge:N2}").FontSize(9).FontColor(Colors.Grey.Darken3);
                                });

                                t.Item().PaddingTop(10).Background(Colors.Grey.Lighten4).Padding(12).Row(r =>
                                {
                                    r.RelativeItem().Text("NET TOTAL").Bold().FontSize(13);
                                    r.ConstantItem(100).AlignRight().Text($"₹ {o.co_net_amount:N2}").Bold().FontSize(13);
                                });
                            });
                        });
                    });

                    // ===== FOOTER =====
                    page.Footer().AlignCenter().PaddingBottom(10).Column(col =>
                    {
                        col.Item().Text(t =>
                        {
                            t.Span("Thank you for your business. Page ");
                            t.CurrentPageNumber();
                            t.Span(" / ");
                            t.TotalPages();
                        });

                        col.Item().PaddingTop(3).Text("Electronic Invoice - No Signature Required");
                    });
                });

            }).GeneratePdf();
        }
    }
}