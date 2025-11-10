using System.ComponentModel.DataAnnotations;

namespace Synos.Api.DTOs;

public class PlaceBidDto
{
    [Range(1, (double)decimal.MaxValue)]
    public decimal Amount { get; set; }
}
