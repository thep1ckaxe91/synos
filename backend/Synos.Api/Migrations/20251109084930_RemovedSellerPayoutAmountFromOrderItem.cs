using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Synos.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemovedSellerPayoutAmountFromOrderItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "seller_payout_amount",
                table: "order_items");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "seller_payout_amount",
                table: "order_items",
                type: "decimal(12,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
