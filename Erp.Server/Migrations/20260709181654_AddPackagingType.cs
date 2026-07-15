using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Erp.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddPackagingType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Address",
                columns: table => new
                {
                    ad_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ad_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ad_address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ad_phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ad_pincode = table.Column<int>(type: "int", nullable: true),
                    ad_is_default_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ad_cre_by = table.Column<int>(type: "int", nullable: true),
                    ad_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ad_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Address", x => x.ad_id);
                });

            migrationBuilder.CreateTable(
                name: "Barcodes",
                columns: table => new
                {
                    b_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    b_prod_id = table.Column<int>(type: "int", nullable: false),
                    b_bar_code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    b_cre_by = table.Column<int>(type: "int", nullable: true),
                    b_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    b_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Barcodes", x => x.b_id);
                });

            migrationBuilder.CreateTable(
                name: "Blogs",
                columns: table => new
                {
                    b_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    b_title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    b_description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    b_content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    b_image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    b_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    b_cre_by = table.Column<int>(type: "int", nullable: true),
                    b_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    b_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Blogs", x => x.b_id);
                });

            migrationBuilder.CreateTable(
                name: "Cart",
                columns: table => new
                {
                    c_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    c_country = table.Column<int>(type: "int", nullable: true),
                    c_product = table.Column<int>(type: "int", nullable: true),
                    c_size = table.Column<int>(type: "int", nullable: true),
                    c_size_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_color = table.Column<int>(type: "int", nullable: true),
                    c_color_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_qty = table.Column<int>(type: "int", nullable: true),
                    c_price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    c_cre_by = table.Column<int>(type: "int", nullable: true),
                    c_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    p_id = table.Column<int>(type: "int", nullable: false),
                    p_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_short_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_category = table.Column<int>(type: "int", nullable: false),
                    p_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_sub_category = table.Column<int>(type: "int", nullable: false),
                    p_sub_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_division = table.Column<int>(type: "int", nullable: false),
                    p_division_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_sub_division = table.Column<int>(type: "int", nullable: false),
                    p_sub_division_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_overall_rating = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    p_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    p_sizes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    p_colors = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    p_attachements = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cart", x => x.c_id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    ct_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ct_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ct_type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ct_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ct_cre_by = table.Column<int>(type: "int", nullable: true),
                    ct_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ct_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.ct_id);
                });

            migrationBuilder.CreateTable(
                name: "ConstantValues",
                columns: table => new
                {
                    cv_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    cv_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    cv_value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    cv_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    cv_cre_by = table.Column<int>(type: "int", nullable: true),
                    cv_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    cv_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConstantValues", x => x.cv_id);
                });

            migrationBuilder.CreateTable(
                name: "CustomerOrders",
                columns: table => new
                {
                    co_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    co_customer = table.Column<int>(type: "int", nullable: true),
                    co_customer_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_customer_phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_customer_email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_c_address = table.Column<int>(type: "int", nullable: true),
                    co_c_address_details = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_status = table.Column<int>(type: "int", nullable: true),
                    co_status_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_qty = table.Column<int>(type: "int", nullable: true),
                    co_product = table.Column<int>(type: "int", nullable: true),
                    co_product_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_size = table.Column<int>(type: "int", nullable: true),
                    co_size_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_color = table.Column<int>(type: "int", nullable: true),
                    co_color_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_unit_price = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    co_discount_perc = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    co_discount_amount = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    co_promo_code = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    co_amount = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    co_gst_perc = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    co_gst_amount = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    co_delivery_charge = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    co_net_amount = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    co_is_canceled = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_is_returned = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_return_id = table.Column<int>(type: "int", nullable: true),
                    co_completed_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_cre_by = table.Column<int>(type: "int", nullable: true),
                    co_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_payment_id = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_refund_id = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    co_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    p_id = table.Column<int>(type: "int", nullable: false),
                    p_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_short_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_category = table.Column<int>(type: "int", nullable: false),
                    p_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_sub_category = table.Column<int>(type: "int", nullable: false),
                    p_sub_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_division = table.Column<int>(type: "int", nullable: false),
                    p_division_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_sub_division = table.Column<int>(type: "int", nullable: false),
                    p_sub_division_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_overall_rating = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    p_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    p_sizes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    p_colors = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    p_attachements = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerOrders", x => x.co_id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    c_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    c_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_username = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_password = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_date_of_birth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    c_is_get_updates = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_agree_terms = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_cre_by = table.Column<int>(type: "int", nullable: true),
                    c_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    c_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.c_id);
                });

            migrationBuilder.CreateTable(
                name: "DashboardStats",
                columns: table => new
                {
                    TotalSales = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalOrders = table.Column<int>(type: "int", nullable: false),
                    ActiveCustomers = table.Column<int>(type: "int", nullable: false),
                    ActiveProducts = table.Column<int>(type: "int", nullable: false),
                    PendingShipments = table.Column<int>(type: "int", nullable: false),
                    NewCustomersWeek = table.Column<int>(type: "int", nullable: false),
                    MonthlyOrders = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "DbResult",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DbResult", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    e_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    e_category = table.Column<int>(type: "int", nullable: false),
                    e_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    e_expense_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    e_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    e_payment_method = table.Column<int>(type: "int", nullable: true),
                    e_payment_method_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    e_remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    e_cre_by = table.Column<int>(type: "int", nullable: true),
                    e_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    e_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.e_id);
                });

            migrationBuilder.CreateTable(
                name: "Favourites",
                columns: table => new
                {
                    f_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    f_product = table.Column<int>(type: "int", nullable: true),
                    f_cre_by = table.Column<int>(type: "int", nullable: true),
                    f_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    f_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    p_id = table.Column<int>(type: "int", nullable: false),
                    p_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_short_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_category = table.Column<int>(type: "int", nullable: false),
                    p_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_sub_category = table.Column<int>(type: "int", nullable: false),
                    p_sub_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_division = table.Column<int>(type: "int", nullable: false),
                    p_division_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_sub_division = table.Column<int>(type: "int", nullable: false),
                    p_sub_division_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_overall_rating = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    p_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    p_sizes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    p_colors = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    p_attachements = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favourites", x => x.f_id);
                });

            migrationBuilder.CreateTable(
                name: "Feedbacks",
                columns: table => new
                {
                    f_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    f_first_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    f_last_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    f_email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    f_phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    f_message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    f_cre_by = table.Column<int>(type: "int", nullable: false),
                    f_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    f_created_on = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feedbacks", x => x.f_id);
                });

            migrationBuilder.CreateTable(
                name: "Incomes",
                columns: table => new
                {
                    i_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    i_category = table.Column<int>(type: "int", nullable: false),
                    i_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    i_income_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    i_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    i_payment_method = table.Column<int>(type: "int", nullable: true),
                    i_payment_method_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    i_remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    i_cre_by = table.Column<int>(type: "int", nullable: true),
                    i_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    i_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incomes", x => x.i_id);
                });

            migrationBuilder.CreateTable(
                name: "MasterDatas",
                columns: table => new
                {
                    md_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    md_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    md_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    md_type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    md_cre_by = table.Column<int>(type: "int", nullable: true),
                    md_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    md_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterDatas", x => x.md_id);
                });

            migrationBuilder.CreateTable(
                name: "MasterTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    type = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Menus",
                columns: table => new
                {
                    m_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    m_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    m_link = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    m_fa_icon = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    m_parrent = table.Column<int>(type: "int", nullable: true),
                    m_parrent_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    m_type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    m_cre_by = table.Column<int>(type: "int", nullable: true),
                    m_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    m_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Menus", x => x.m_id);
                });

            migrationBuilder.CreateTable(
                name: "MenuTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    menuType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "OrderMovementHistories",
                columns: table => new
                {
                    omh_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    omh_order_no = table.Column<int>(type: "int", nullable: true),
                    omh_status = table.Column<int>(type: "int", nullable: true),
                    omh_status_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    omh_workflow_id = table.Column<int>(type: "int", nullable: true),
                    omh_cre_by = table.Column<int>(type: "int", nullable: true),
                    omh_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    omh_cre_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderMovementHistories", x => x.omh_id);
                });

            migrationBuilder.CreateTable(
                name: "PackagingTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Length = table.Column<int>(type: "int", nullable: false),
                    Breadth = table.Column<int>(type: "int", nullable: false),
                    Height = table.Column<int>(type: "int", nullable: false),
                    IPkgType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Active = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackagingTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProdAttachments",
                columns: table => new
                {
                    pa_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    pa_prod_id = table.Column<int>(type: "int", nullable: true),
                    pa_color = table.Column<int>(type: "int", nullable: true),
                    pa_color_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    pa_image_path = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    pa_cre_by = table.Column<int>(type: "int", nullable: true),
                    pa_cre_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdAttachments", x => x.pa_id);
                });

            migrationBuilder.CreateTable(
                name: "ProdColors",
                columns: table => new
                {
                    pc_color = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    pc_color_name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdColors", x => x.pc_color);
                });

            migrationBuilder.CreateTable(
                name: "ProdSizes",
                columns: table => new
                {
                    ps_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ps_prod_id = table.Column<int>(type: "int", nullable: false),
                    ps_size = table.Column<int>(type: "int", nullable: false),
                    ps_size_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ps_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ps_cre_by = table.Column<int>(type: "int", nullable: false),
                    ps_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdSizes", x => x.ps_id);
                });

            migrationBuilder.CreateTable(
                name: "ProductReviews",
                columns: table => new
                {
                    pr_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    pr_prod_id = table.Column<int>(type: "int", nullable: false),
                    pr_overall_rating = table.Column<int>(type: "int", nullable: false),
                    pr_head_line = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    pr_review = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    pr_cre_by = table.Column<int>(type: "int", nullable: false),
                    pr_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    pr_created_on = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductReviews", x => x.pr_id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    p_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    p_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_short_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_category = table.Column<int>(type: "int", nullable: false),
                    p_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_sub_category = table.Column<int>(type: "int", nullable: false),
                    p_sub_category_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_division = table.Column<int>(type: "int", nullable: false),
                    p_division_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_sub_division = table.Column<int>(type: "int", nullable: false),
                    p_sub_division_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_overall_rating = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    p_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    p_cre_by = table.Column<int>(type: "int", nullable: true),
                    p_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    p_cre_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    p_sizes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    p_colors = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    p_attachements = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.p_id);
                });

            migrationBuilder.CreateTable(
                name: "Promocodes",
                columns: table => new
                {
                    pc_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    pc_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    pc_discount_perc = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    pc_max_discount_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    pc_min_order_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    pc_expiry_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    pc_active_yn = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    pc_cre_by = table.Column<int>(type: "int", nullable: true),
                    pc_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    pc_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promocodes", x => x.pc_id);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseOrders",
                columns: table => new
                {
                    po_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    po_make = table.Column<int>(type: "int", nullable: true),
                    po_model = table.Column<int>(type: "int", nullable: true),
                    po_processor = table.Column<int>(type: "int", nullable: true),
                    po_harddisk = table.Column<int>(type: "int", nullable: true),
                    po_ram = table.Column<int>(type: "int", nullable: true),
                    po_cre_by = table.Column<int>(type: "int", nullable: true),
                    po_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    po_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrders", x => x.po_id);
                });

            migrationBuilder.CreateTable(
                name: "ReturnOrders",
                columns: table => new
                {
                    ro_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ro_order_no = table.Column<int>(type: "int", nullable: false),
                    ro_status = table.Column<int>(type: "int", nullable: false),
                    ro_status_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ro_reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ro_comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ro_cre_by = table.Column<int>(type: "int", nullable: true),
                    ro_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ro_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ro_prod_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ro_customer_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ro_net_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ro_payment_id = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ro_completed_yn = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReturnOrders", x => x.ro_id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    r_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    r_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    r_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    r_cre_by = table.Column<int>(type: "int", nullable: true),
                    r_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    r_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.r_id);
                });

            migrationBuilder.CreateTable(
                name: "SellingPrices",
                columns: table => new
                {
                    sp_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    sp_prod_id = table.Column<int>(type: "int", nullable: true),
                    sp_prod_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sp_country_id = table.Column<int>(type: "int", nullable: true),
                    sp_country_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sp_price_type = table.Column<int>(type: "int", nullable: true),
                    sp_price_type_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    sp_price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    sp_start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    sp_end_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    sp_cre_by = table.Column<int>(type: "int", nullable: true),
                    sp_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sp_cre_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SellingPrices", x => x.sp_id);
                });

            migrationBuilder.CreateTable(
                name: "Sliders",
                columns: table => new
                {
                    s_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    s_title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    s_image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    s_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    s_cre_by = table.Column<int>(type: "int", nullable: true),
                    s_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    s_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sliders", x => x.s_id);
                });

            migrationBuilder.CreateTable(
                name: "Statuses",
                columns: table => new
                {
                    s_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    s_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    s_cre_by = table.Column<int>(type: "int", nullable: true),
                    s_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    s_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    s_workflow_id = table.Column<int>(type: "int", nullable: true),
                    cos_priority = table.Column<int>(type: "int", nullable: true),
                    s_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Statuses", x => x.s_id);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    s_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    s_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    s_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    s_cre_by = table.Column<int>(type: "int", nullable: true),
                    s_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    s_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.s_id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    u_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    u_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_username = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_password = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_role_id = table.Column<int>(type: "int", nullable: true),
                    u_role_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_date_of_birth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    u_is_get_updates = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_agree_terms = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_is_admin = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_active_yn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_cre_by = table.Column<int>(type: "int", nullable: true),
                    u_cre_by_name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_email_verified = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_phone_verified = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    u_cre_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.u_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Address");

            migrationBuilder.DropTable(
                name: "Barcodes");

            migrationBuilder.DropTable(
                name: "Blogs");

            migrationBuilder.DropTable(
                name: "Cart");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "ConstantValues");

            migrationBuilder.DropTable(
                name: "CustomerOrders");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "DashboardStats");

            migrationBuilder.DropTable(
                name: "DbResult");

            migrationBuilder.DropTable(
                name: "Expenses");

            migrationBuilder.DropTable(
                name: "Favourites");

            migrationBuilder.DropTable(
                name: "Feedbacks");

            migrationBuilder.DropTable(
                name: "Incomes");

            migrationBuilder.DropTable(
                name: "MasterDatas");

            migrationBuilder.DropTable(
                name: "MasterTypes");

            migrationBuilder.DropTable(
                name: "Menus");

            migrationBuilder.DropTable(
                name: "MenuTypes");

            migrationBuilder.DropTable(
                name: "OrderMovementHistories");

            migrationBuilder.DropTable(
                name: "PackagingTypes");

            migrationBuilder.DropTable(
                name: "ProdAttachments");

            migrationBuilder.DropTable(
                name: "ProdColors");

            migrationBuilder.DropTable(
                name: "ProdSizes");

            migrationBuilder.DropTable(
                name: "ProductReviews");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Promocodes");

            migrationBuilder.DropTable(
                name: "PurchaseOrders");

            migrationBuilder.DropTable(
                name: "ReturnOrders");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "SellingPrices");

            migrationBuilder.DropTable(
                name: "Sliders");

            migrationBuilder.DropTable(
                name: "Statuses");

            migrationBuilder.DropTable(
                name: "Suppliers");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
