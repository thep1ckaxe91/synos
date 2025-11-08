using Synos.Api.DTOs;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Synos.Api.Services
{
    public class VnPayService : IVnPayService
    {
        private readonly IConfiguration _configuration;

        public VnPayService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string CreatePaymentUrl(VnPayPaymentRequestDto model, HttpContext context)
        {
            var vnpayConfig = _configuration.GetSection("VnpaySettings");
            var tmnCode = vnpayConfig["TmnCode"];
            var hashSecret = vnpayConfig["HashSecret"];
            var baseUrl = vnpayConfig["BaseUrl"];
            var returnUrl = vnpayConfig["ReturnUrl"];

            ArgumentNullException.ThrowIfNull(tmnCode);
            ArgumentNullException.ThrowIfNull(hashSecret);
            ArgumentNullException.ThrowIfNull(baseUrl);
            ArgumentNullException.ThrowIfNull(returnUrl);

            var pay = new VnPayLibrary();
            pay.AddRequestData("vnp_Version", vnpayConfig["Version"] ?? "2.1.0");
            pay.AddRequestData("vnp_Command", vnpayConfig["Command"] ?? "pay");
            pay.AddRequestData("vnp_TmnCode", tmnCode);
            pay.AddRequestData("vnp_Amount", ((long)model.Amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", vnpayConfig["CurrCode"] ?? "VND");
            pay.AddRequestData("vnp_IpAddr", GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", vnpayConfig["Locale"] ?? "vn");
            pay.AddRequestData("vnp_OrderInfo", model.OrderInfo);
            pay.AddRequestData("vnp_OrderType", "other"); // Can be customized
            pay.AddRequestData("vnp_ReturnUrl", returnUrl);
            pay.AddRequestData("vnp_TxnRef", model.OrderId.ToString());

            string paymentUrl = pay.CreateRequestUrl(baseUrl, hashSecret);
            return paymentUrl;
        }

        public VnPayIpnResponseDto ProcessIpn(IQueryCollection collections)
        {
            var vnpayConfig = _configuration.GetSection("VnpaySettings");
            var hashSecret = vnpayConfig["HashSecret"];
            ArgumentNullException.ThrowIfNull(hashSecret);

            var pay = new VnPayLibrary();

            foreach (var (key, value) in collections)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    pay.AddResponseData(key, value.ToString());
                }
            }

            long orderId = Convert.ToInt64(pay.GetResponseData("vnp_TxnRef"));
            long vnpayTranId = Convert.ToInt64(pay.GetResponseData("vnp_TransactionNo"));
            string vnpResponseCode = pay.GetResponseData("vnp_ResponseCode");
            string vnpSecureHash = collections["vnp_SecureHash"].ToString();

            bool checkSignature = pay.ValidateSignature(vnpSecureHash, hashSecret);

            if (!checkSignature)
            {
                return new VnPayIpnResponseDto { RspCode = "97", Message = "Invalid Signature" };
            }

            // Here you would typically fetch the order/payment from your database
            // and check if the amount matches, if the order exists, etc.
            // For now, we just validate the VNPay response code.

            if (vnpResponseCode == "00")
            {
                // Payment successful
                // TODO: Update database status for order/payment with `orderId`
                return new VnPayIpnResponseDto { RspCode = "00", Message = "Confirm Success" };
            }
            else
            {
                // Payment failed
                // TODO: Update database status for order/payment with `orderId`
                return new VnPayIpnResponseDto { RspCode = vnpResponseCode, Message = "Confirm Failed" };
            }
        }

        private string GetIpAddress(HttpContext context)
        {
            var ipAddress = string.Empty;
            try
            {
                var remoteIpAddress = context.Connection.RemoteIpAddress;
                if (remoteIpAddress != null)
                {
                    if (remoteIpAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
                    {
                        remoteIpAddress = Dns.GetHostEntry(remoteIpAddress).AddressList
                            .FirstOrDefault(x => x.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
                    }

                    if (remoteIpAddress != null) ipAddress = remoteIpAddress.ToString();
                }
            }
            catch { ipAddress = "127.0.0.1"; }
            return ipAddress;
        }
    }

    public class VnPayLibrary
    {
        private readonly SortedList<string, string> _requestData = new SortedList<string, string>(StringComparer.Ordinal);
        private readonly SortedList<string, string> _responseData = new SortedList<string, string>(StringComparer.Ordinal);

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData.Add(key, value);
            }
        }

        public void AddResponseData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _responseData.Add(key, value);
            }
        }

        public string GetResponseData(string key)
        {
            return _responseData.TryGetValue(key, out var retValue) ? retValue : string.Empty;
        }

        public string CreateRequestUrl(string baseUrl, string hashSecret)
        {
            var data = new StringBuilder();
            foreach (var (key, value) in _requestData)
            {
                if (!string.IsNullOrEmpty(value))
                {
                    data.Append(WebUtility.UrlEncode(key) + "=" + WebUtility.UrlEncode(value) + "&");
                }
            }
            string queryString = data.ToString();

            baseUrl += "?" + queryString;
            string signData = queryString.Remove(queryString.Length - 1, 1);
            string vnp_SecureHash = HmacSHA512(hashSecret, signData);
            baseUrl += "vnp_SecureHash=" + vnp_SecureHash;

            return baseUrl;
        }

        public bool ValidateSignature(string inputHash, string secretKey)
        {
            string myChecksum = HmacSHA512(secretKey, GetResponseDataRaw());
            return myChecksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
        }

        private string GetResponseDataRaw()
        {
            var data = new StringBuilder();
            foreach (var (key, value) in _responseData)
            {
                if (!string.IsNullOrEmpty(value) && key != "vnp_SecureHash")
                {
                    data.Append(WebUtility.UrlEncode(key) + "=" + WebUtility.UrlEncode(value) + "&");
                }
            }
            //remove last '&'
            if (data.Length > 0)
            {
                data.Remove(data.Length - 1, 1);
            }
            return data.ToString();
        }

        private static string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var b in hashValue)
                {
                    hash.Append(b.ToString("x2"));
                }
            }
            return hash.ToString();
        }
    }
}
