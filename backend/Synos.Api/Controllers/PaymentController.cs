using Microsoft.AspNetCore.Mvc;
using Synos.Api.DTOs;
using Synos.Api.Services;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;
        // private readonly ICommissionPaymentRepository _commissionPaymentRepository; // Will be needed later

        public PaymentController(IVnPayService vnPayService /*, ICommissionPaymentRepository commissionPaymentRepository */)
        {
            _vnPayService = vnPayService;
            // _commissionPaymentRepository = commissionPaymentRepository;
        }

        [HttpPost("create-commission-payment")]
        // [Authorize(Roles = "Seller")] // Authorization should be added later
        public IActionResult CreateCommissionPaymentUrl([FromBody] CreateCommissionPaymentRequestDto request)
        {
            // --- DATABASE LOGIC (Commented out for now) ---
            // var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            // var commissionPayment = await _commissionPaymentRepository.GetByIdAsync(request.CommissionPaymentId);
            //
            // if (commissionPayment == null || commissionPayment.SellerId != userId)
            // {
            //     return NotFound("Commission payment not found or you do not have permission to pay it.");
            // }
            //
            // if (commissionPayment.Status == PaymentStatus.Paid)
            // {
            //     return BadRequest("This commission has already been paid.");
            // }
            // -------------------------------------------------

            // For now, we use dummy data. Replace with real data from commissionPayment object later.
            var amount = 10000; // Example amount: 10,000 VND
            var orderInfo = $"Payment for commission #{request.CommissionPaymentId}";

            var paymentRequest = new VnPayPaymentRequestDto
            {
                OrderId = request.CommissionPaymentId, // Use the commission payment ID as the unique reference
                Amount = amount,
                OrderInfo = orderInfo
            };

            var paymentUrl = _vnPayService.CreatePaymentUrl(paymentRequest, HttpContext);

            return Ok(new { PaymentUrl = paymentUrl });
        }

        [HttpGet("vnpay-callback")]
        public IActionResult VnPayCallback()
        {
            var response = _vnPayService.ProcessIpn(Request.Query);

            if (response.RspCode == "00")
            {
                // --- DATABASE LOGIC (Commented out for now) ---
                // var commissionPaymentId = long.Parse(Request.Query["vnp_TxnRef"]);
                // var commissionPayment = await _commissionPaymentRepository.GetByIdAsync(commissionPaymentId);
                // if (commissionPayment != null)
                // {
                //     commissionPayment.Status = PaymentStatus.Paid;
                //     commissionPayment.PaidAt = DateTime.UtcNow;
                //     commissionPayment.PaymentGatewayTxnRef = Request.Query["vnp_TransactionNo"];
                //     await _commissionPaymentRepository.UpdateAsync(commissionPayment);
                // }
                // -------------------------------------------------
                
                // Return the response to VNPay
                return Ok(response);
            }
            else
            {
                // --- DATABASE LOGIC (Commented out for now) ---
                // var commissionPaymentId = long.Parse(Request.Query["vnp_TxnRef"]);
                // var commissionPayment = await _commissionPaymentRepository.GetByIdAsync(commissionPaymentId);
                // if (commissionPayment != null)
                // {
                //     commissionPayment.Status = PaymentStatus.Failed;
                //     await _commissionPaymentRepository.UpdateAsync(commissionPayment);
                // }
                // -------------------------------------------------

                // Return the response to VNPay
                return Ok(response);
            }
        }
    }

    public class CreateCommissionPaymentRequestDto
    {
        public long CommissionPaymentId { get; set; }
    }
}
