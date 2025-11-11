using System.Collections.Concurrent;
using System.Text.Json;
using Synos.Api.Models;
using Synos.Api.Models.AuctionDataModels;
using Synos.Api.Repositories;

namespace Synos.Api.Services.AuctionServices;

public class AuctionFileManagerService : IAuctionFileManagerService
{
    private readonly string _auctionDataPath;
    private readonly IArtworkRepository _artworkRepository;
    private static readonly ConcurrentDictionary<long, SemaphoreSlim> _fileLocks = new(); // Changed key to long

    public AuctionFileManagerService(IWebHostEnvironment env, IArtworkRepository artworkRepository)
    {
        _artworkRepository = artworkRepository;
        _auctionDataPath = Path.Combine(env.ContentRootPath, "AuctionData");
        if (!Directory.Exists(_auctionDataPath))
        {
            Directory.CreateDirectory(_auctionDataPath);
        }
    }

    private string GetFilePath(long auctionId) => Path.Combine(_auctionDataPath, $"{auctionId}.json"); // Changed parameter to long

    private SemaphoreSlim GetLock(long auctionId) => _fileLocks.GetOrAdd(auctionId, _ => new SemaphoreSlim(1, 1)); // Changed parameter to long

    public async Task<AuctionData> CreateAuctionFileAsync(Auction auction)
    {
        var artwork = await _artworkRepository.GetArtworkByIdAsync(auction.ArtworkId);
        var auctionData = new AuctionData
        {
            AuctionId = auction.Id, // Already long
            ArtworkId = auction.ArtworkId, // Already long
            ArtworkName = artwork?.Title ?? "Unknown Artwork", // Changed from Name to Title
            StartTime = auction.StartTime,
            EndTime = auction.EndTime,
            StartingPrice = auction.StartingPrice,
            Bids = new List<BidData>()
        };

        var filePath = GetFilePath(auction.Id);
        var semaphore = GetLock(auction.Id);

        await semaphore.WaitAsync();
        try
        {
            var json = JsonSerializer.Serialize(auctionData, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(filePath, json);
            return auctionData;
        }
        finally
        {
            semaphore.Release();
        }
    }

    public async Task<IEnumerable<AuctionData>> GetAllActiveAuctionsAsync()
    {
        var auctionFiles = Directory.GetFiles(_auctionDataPath, "*.json");
        var auctions = new List<AuctionData>();

        foreach (var file in auctionFiles)
        {
            var auctionIdStr = Path.GetFileNameWithoutExtension(file);
            if (long.TryParse(auctionIdStr, out var auctionId)) // Changed Guid.TryParse to long.TryParse
            {
                var auctionData = await GetAuctionDetailsAsync(auctionId);
                if (auctionData != null)
                {
                    auctions.Add(auctionData);
                }
            }
        }
        return auctions;
    }

    public async Task<AuctionData?> GetAuctionDetailsAsync(long auctionId) // Changed parameter to long
    {
        var filePath = GetFilePath(auctionId);
        if (!File.Exists(filePath))
        {
            return null;
        }

        var semaphore = GetLock(auctionId);
        await semaphore.WaitAsync();
        try
        {
            var json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<AuctionData>(json);
        }
        catch (Exception)
        {
            // Log error if necessary
            return null;
        }
        finally
        {
            semaphore.Release();
        }
    }

    public async Task AddBidAsync(long auctionId, BidData bid) // Changed parameter to long
    {
        var filePath = GetFilePath(auctionId);
        var semaphore = GetLock(auctionId);

        await semaphore.WaitAsync();
        try
        {
            var json = await File.ReadAllTextAsync(filePath);
            var auctionData = JsonSerializer.Deserialize<AuctionData>(json);

            if (auctionData != null)
            {
                auctionData.Bids.Add(bid);
                var updatedJson = JsonSerializer.Serialize(auctionData, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(filePath, updatedJson);
            }
        }
        finally
        {
            semaphore.Release();
        }
    }

    public void DeleteAuctionFile(long auctionId) // Changed parameter to long
    {
        var filePath = GetFilePath(auctionId);
        var semaphore = GetLock(auctionId);

        semaphore.Wait();
        try
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        finally
        {
            semaphore.Release();
            _fileLocks.TryRemove(auctionId, out _);
        }
    }
}
