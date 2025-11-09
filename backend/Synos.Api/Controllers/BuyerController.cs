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
                // This can be null if artwork is not available or if the user is not a buyer.
                // We return BadRequest, but a more specific error could be determined if needed.
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
                // Can be null if order not found, user doesn't have permission, or order is not pending.
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
    }
}