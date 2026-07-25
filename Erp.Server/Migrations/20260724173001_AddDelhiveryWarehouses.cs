using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Erp.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDelhiveryWarehouses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Address",
                table: "Address");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Cart",
                table: "Cart");

            migrationBuilder.DropColumn(
                name: "cv_cre_by_name",
                table: "ConstantValues");

            migrationBuilder.RenameTable(
                name: "Address",
                newName: "address");

            migrationBuilder.RenameTable(
                name: "Cart",
                newName: "carts");

            migrationBuilder.RenameColumn(
                name: "TypeName",
                table: "PackagingTypes",
                newName: "pt_pkg_type");

            migrationBuilder.RenameColumn(
                name: "Length",
                table: "PackagingTypes",
                newName: "pt_length");

            migrationBuilder.RenameColumn(
                name: "IPkgType",
                table: "PackagingTypes",
                newName: "pt_name");

            migrationBuilder.RenameColumn(
                name: "Height",
                table: "PackagingTypes",
                newName: "pt_height");

            migrationBuilder.RenameColumn(
                name: "Breadth",
                table: "PackagingTypes",
                newName: "pt_breadth");

            migrationBuilder.RenameColumn(
                name: "Active",
                table: "PackagingTypes",
                newName: "pt_cre_by_name");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "PackagingTypes",
                newName: "pt_id");

            migrationBuilder.AddColumn<int>(
                name: "p_packaging_type",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "p_packaging_type_name",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pt_active_yn",
                table: "PackagingTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "pt_cre_by",
                table: "PackagingTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "pt_cre_date",
                table: "PackagingTypes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "co_waybill",
                table: "CustomerOrders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_address",
                table: "address",
                column: "ad_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_carts",
                table: "carts",
                column: "c_id");

            migrationBuilder.CreateTable(
                name: "DelhiveryWarehouses",
                columns: table => new
                {
                    dw_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    dw_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dw_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    dw_city = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dw_state = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dw_country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dw_pincode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    dw_phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    dw_email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dw_registered_yn = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    dw_created_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DelhiveryWarehouses", x => x.dw_id);
                });

            migrationBuilder.CreateTable(
                name: "Waybills",
                columns: table => new
                {
                    wb_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    wb_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    wb_status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    wb_order_id = table.Column<int>(type: "int", nullable: true),
                    wb_used_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    wb_created_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Waybills", x => x.wb_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DelhiveryWarehouses");

            migrationBuilder.DropTable(
                name: "Waybills");

            migrationBuilder.DropPrimaryKey(
                name: "PK_address",
                table: "address");

            migrationBuilder.DropPrimaryKey(
                name: "PK_carts",
                table: "carts");

            migrationBuilder.DropColumn(
                name: "p_packaging_type",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "p_packaging_type_name",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "pt_active_yn",
                table: "PackagingTypes");

            migrationBuilder.DropColumn(
                name: "pt_cre_by",
                table: "PackagingTypes");

            migrationBuilder.DropColumn(
                name: "pt_cre_date",
                table: "PackagingTypes");

            migrationBuilder.DropColumn(
                name: "co_waybill",
                table: "CustomerOrders");

            migrationBuilder.RenameTable(
                name: "address",
                newName: "Address");

            migrationBuilder.RenameTable(
                name: "carts",
                newName: "Cart");

            migrationBuilder.RenameColumn(
                name: "pt_pkg_type",
                table: "PackagingTypes",
                newName: "TypeName");

            migrationBuilder.RenameColumn(
                name: "pt_name",
                table: "PackagingTypes",
                newName: "IPkgType");

            migrationBuilder.RenameColumn(
                name: "pt_length",
                table: "PackagingTypes",
                newName: "Length");

            migrationBuilder.RenameColumn(
                name: "pt_height",
                table: "PackagingTypes",
                newName: "Height");

            migrationBuilder.RenameColumn(
                name: "pt_cre_by_name",
                table: "PackagingTypes",
                newName: "Active");

            migrationBuilder.RenameColumn(
                name: "pt_breadth",
                table: "PackagingTypes",
                newName: "Breadth");

            migrationBuilder.RenameColumn(
                name: "pt_id",
                table: "PackagingTypes",
                newName: "Id");

            migrationBuilder.AddColumn<string>(
                name: "cv_cre_by_name",
                table: "ConstantValues",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Address",
                table: "Address",
                column: "ad_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Cart",
                table: "Cart",
                column: "c_id");
        }
    }
}
