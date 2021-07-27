using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace AssetControl.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Asset",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    YtgNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssetDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PurchaseOrder = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LineNumber = table.Column<int>(type: "int", nullable: true),
                    Make = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Model = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SerialNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DatePurchased = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Owner = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DepartmentName = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Asset", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TransferRequest",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    YtgNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateCurrent = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateOfTransaction = table.Column<DateTime>(type: "datetime2", nullable: true),
                    From = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferRequest", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Warehouse",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    To = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    From = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateofTransaction = table.Column<DateTime>(type: "datetime2", nullable: true),
                    YTGNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Uniquedonation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MailCodeIn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MailCodeOut = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubCategory = table.Column<int>(type: "int", nullable: true),
                    Area = table.Column<int>(type: "int", nullable: true),
                    StaffId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouse", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Asset");

            migrationBuilder.DropTable(
                name: "TransferRequest");

            migrationBuilder.DropTable(
                name: "Warehouse");
        }
    }
}
