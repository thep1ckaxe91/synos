using Microsoft.AspNetCore.Mvc;
using Synos.Api.Services;

namespace Synos.Api.Controllers
{
    [ApiController]
    [Route("api/seller")]
    // [Authorize(Roles = "Seller")] // We will add authorization later
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }

        // Endpoints for seller functionalities will be added here
    }
}
