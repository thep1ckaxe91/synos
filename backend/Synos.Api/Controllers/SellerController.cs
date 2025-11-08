using Microsoft.AspNetCore.Mvc;
using Synos.Api.Attributes;
using Synos.Api.Services;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/seller")]
    [JwtAuthorize("Seller")]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Seller endpoint is working");
        }

        // Endpoints for seller functionalities will be added here
    }
}
