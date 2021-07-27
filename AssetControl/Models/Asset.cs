using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssetControl.api.Models
{
    public class Asset
    {

            [Key]
            public int Id { get; set; }


            public string YtgNumber { get; set; }


            public string AssetDescription { get; set; }


            public string PurchaseOrder { get; set; }


            public string Type { get; set; }


            public string Status { get; set; }


            public int? LineNumber { get; set; }


            public string Make { get; set; }


            public string Model { get; set; }


            public string SerialNo { get; set; }


            public DateTime? DatePurchased { get; set; }


            public string Owner { get; set; }


            public string DepartmentName { get; set; }

      
    }
}
