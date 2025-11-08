namespace Synos.Api.DTOs
{
    public class VnPayPaymentRequestDto
    {
        public long OrderId { get; set; }
        public string OrderInfo { get; set; } = string.Empty;
        public double Amount { get; set; }
    }

    public class VnPayPaymentResponseDto
    {
        public bool IsSuccess { get; set; }
        public string PaymentUrl { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class VnPayIpnResponseDto
    {
        public string RspCode { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
