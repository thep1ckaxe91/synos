using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Synos.Api.Attributes;
using Synos.Api.DTOs;
using Synos.Api.Extensions;
using Synos.Api.Services;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/buyer")]
    [JwtAuthorize]
    public class BuyerController : ControllerBase
    {
        private readonly IBuyerService _buyerService;
        private readonly IConfiguration _configuration;

        public BuyerController(IBuyerService buyerService, IConfiguration configuration)
        {
            _buyerService = buyerService;
            _configuration = configuration;
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetPurchaseHistory()
        {
            var memberId = HttpContext.GetCurrentMemberId();
            if (memberId == null)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var orders = await _buyerService.GetPurchaseHistoryAsync(memberId.Value);
            return Ok(orders);
        }

        [HttpPost("orders")]
        public async Task<IActionResult> PlaceOrder([FromBody] CreateOrderDto createOrderDto)
        {
            var memberId = HttpContext.GetCurrentMemberId();
            if (memberId == null)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var result = await _buyerService.PlaceOrderAsync(memberId.Value, createOrderDto);

            if (result == null)
            {
                return BadRequest(new { message = "Could not place order. The artwork may not be available or your account is not authorized." });
            }

            return Ok(result);
        }

        [HttpPost("orders/{orderId}/pay")]
        public async Task<IActionResult> InitiatePayment(long orderId)
        {
            var memberId = HttpContext.GetCurrentMemberId();
            if (memberId == null)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var paymentUrl = await _buyerService.InitiatePaymentAsync(memberId.Value, orderId, HttpContext);

            if (paymentUrl == null)
            {
                return NotFound(new { message = "Order not found, you do not have permission, or the order cannot be paid for." });
            }

            return Ok(new { paymentUrl });
        }

        [HttpGet("payment/vnpay-return")]
        [AllowAnonymous]
        public async Task<IActionResult> VnPayReturn()
        {
            var response = await _buyerService.ProcessVnPayReturnAsync(Request.Query);
            
            var returnUrl = _configuration["VnpaySettings:ReturnUrl"];
            ArgumentException.ThrowIfNullOrEmpty(returnUrl);

            var redirectUrl = $"{returnUrl}?orderId={response.OrderId}&amount={response.Amount}&success={response.Success}&paymentMethod=VNPAY";

            return Redirect(redirectUrl);
        }

        [HttpPost("payment/vnpay-ipn")]
        [AllowAnonymous]
        public async Task<IActionResult> VnPayIpn()
        {
            var response = await _buyerService.ProcessVnPayIpnAsync(Request.Query);
            return Ok(response);
        }

        // Auction Endpoints
        [HttpGet("auctions")]
        public async Task<IActionResult> GetActiveAuctions([FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            var auctions = await _buyerService.GetActiveAuctionsAsync(skip, take);
            return Ok(auctions);
        }

        [HttpGet("auctions/{id}")]
        public async Task<ActionResult<AuctionDetailDto>> GetAuctionDetails(long id)
        {
            var auction = await _buyerService.GetAuctionDetailsAsync(id);
            if (auction == null)
            {
                return NotFound(new { message = "Auction not found" });
            }
            return Ok(auction);
        }

        [HttpPost("auctions/{id}/bids")]
        public async Task<IActionResult> PlaceBid(long id, [FromBody] PlaceBidDto bidDto) // Changed from Guid to long
        {
            var memberId = HttpContext.GetCurrentMemberId();
            if (memberId == null)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var success = await _buyerService.PlaceBidAsync(id, memberId.Value, bidDto.Amount);

            if (!success)
            {
                return BadRequest(new { message = "Could not place bid. The auction may have ended or your bid is not high enough." });
            }

            return Ok(new { message = "Bid placed successfully." });
        }
    }
}