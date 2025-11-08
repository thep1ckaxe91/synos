using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Synos.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMemberModelRemoveSellerTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_artworks_sellers_seller_id",
                table: "artworks");

            migrationBuilder.DropTable(
                name: "sellers");

            migrationBuilder.AddColumn<string>(
                name: "bio",
                table: "members",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "profile_image",
                table: "members",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_artworks_members_seller_id",
                table: "artworks",
                column: "seller_id",
                principalTable: "members",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_artworks_members_seller_id",
                table: "artworks");

            migrationBuilder.DropColumn(
                name: "bio",
                table: "members");

            migrationBuilder.DropColumn(
                name: "profile_image",
                table: "members");

            migrationBuilder.CreateTable(
                name: "sellers",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false),
                    address = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    bio = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    deleted_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    profile_image = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    website = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sellers", x => x.id);
                    table.ForeignKey(
                        name: "FK_sellers_members_id",
                        column: x => x.id,
                        principalTable: "members",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_artworks_sellers_seller_id",
                table: "artworks",
                column: "seller_id",
                principalTable: "sellers",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
