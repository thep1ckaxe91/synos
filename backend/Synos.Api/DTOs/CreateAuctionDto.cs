using System.ComponentModel.DataAnnotations;

namespace Synos.Api.DTOs;

public class CreateAuctionDto
{
    [Required]
    public long ArtworkId { get; set; }

    [Required]
    [Range(1, (double)decimal.MaxValue)]
    public decimal StartingPrice { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}
