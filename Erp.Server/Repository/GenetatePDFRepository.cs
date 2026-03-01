using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using Erp.Server.Models;
using Erp.Server.Services;

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
                    page.Margin(30);

                    // ===== HEADER =====
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            // LOGO
                            row.ConstantItem(80).Height(60)
                                .Image("wwwroot/logo/logo.png", ImageScaling.FitArea);

                            // COMPANY INFO
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text(companyName).Bold().FontSize(18);
                                c.Item().Text(companyAddress);
                                c.Item().Text($"Phone : {companyPhone}");
                                c.Item().Text($"GST : {TaxRegNo}");
                            });

                            // INVOICE INFO
                            row.ConstantItem(180).AlignRight().Column(c =>
                            {
                                c.Item().Text("TAX INVOICE").Bold().FontSize(18);
                                c.Item().Text($"Invoice : CO-{o.co_id}");
                                c.Item().Text($"Date : {o.co_cre_date:dd-MM-yyyy}");
                            });
                        });

                        // ===== DOUBLE LINE =====
                        col.Item().PaddingTop(5).BorderBottom(2);
                        col.Item().BorderBottom(0.5f).BorderColor("#bbbbbb");
                    });

                    // ===== CUSTOMER =====
                    page.Content().PaddingVertical(15).Column(col =>
                    {
                        col.Item().Text($"Customer : {o.co_customer_name}");
                        col.Item().Text($"Phone : {o.co_customer_phone}");
                        col.Item().Text($"Address : {o.co_c_address_details}");

                        col.Item().PaddingTop(15).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn();
                                c.ConstantColumn(60);
                                c.ConstantColumn(80);
                                c.ConstantColumn(80);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Text("Product").Bold();
                                h.Cell().AlignRight().Text("Qty").Bold();
                                h.Cell().AlignRight().Text("Price").Bold();
                                h.Cell().AlignRight().Text("Total").Bold();
                            });

                            decimal price = o.co_unit_price ?? 0;
                            decimal qty = o.co_qty ?? 0;
                            decimal amount = price * qty;

                            table.Cell().Text(o.co_product_name);
                            table.Cell().AlignRight().Text(qty.ToString());
                            table.Cell().AlignRight().Text($"₹ {price}");
                            table.Cell().AlignRight().Text($"₹ {amount}");
                        });

                        col.Item().PaddingTop(30);

                        col.Item().PaddingTop(20).Row(row =>
                        {
                            // LEFT HALF EMPTY
                            row.RelativeItem();

                            // RIGHT HALF TOTALS
                            row.RelativeItem().Column(t =>
                            {
                                void Line(string label, string value)
                                {
                                    t.Item().Row(r =>
                                    {
                                        r.RelativeItem().Text(label);
                                        r.ConstantItem(120).AlignRight().Text(value);
                                    });
                                }

                                Line($"Discount ({o.co_discount_perc}%) :", $"₹ {o.co_discount_amount}");
                                Line($"GST ({o.co_gst_perc}%) :", $"₹ {o.co_gst_amount}");
                                Line("Delivery :", $"₹ {o.co_delivery_charge}");

                                t.Item().PaddingTop(15);

                                t.Item().Row(r =>
                                {
                                    r.RelativeItem().Text("Net Total :").Bold().FontSize(16);
                                    r.ConstantItem(120).AlignRight()
                                        .Text($"₹ {o.co_net_amount}")
                                        .Bold().FontSize(16);
                                });
                            });
                        });


                    });

                    page.Footer().AlignCenter()
                        .Text("Thank you for your business")
                        .FontSize(10);
                });

            }).GeneratePdf();
        }
    }
}