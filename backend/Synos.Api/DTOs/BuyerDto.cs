using System.ComponentModel.DataAnnotations;

namespace Synos.Api.DTOs
{
    public class CreateOrderDto
    {
        [Required]
        public long ArtworkId { get; set; }
    }

    public class VnPayReturnDto
    {
        public bool Success { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string Amount { get; set; } = string.Empty;
    }
}
