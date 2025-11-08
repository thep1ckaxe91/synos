using Synos.Api.DTOs;

namespace Synos.Api.Services
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(VnPayPaymentRequestDto model, HttpContext context);
        VnPayIpnResponseDto ProcessIpn(IQueryCollection collections);
    }
}
