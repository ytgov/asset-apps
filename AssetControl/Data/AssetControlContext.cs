using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AssetControl.api.Models;

namespace AssetControl.Data
{
    public class AssetControlContext : DbContext
    {
        public AssetControlContext (DbContextOptions<AssetControlContext> options)
            : base(options)
        {
        }

        public DbSet<AssetControl.api.Models.Asset> Asset { get; set; }

        public DbSet<AssetControl.api.Models.Warehouse> Warehouse { get; set; }

        public DbSet<AssetControl.api.Models.TransferRequest> TransferRequest { get; set; }
    }
}
