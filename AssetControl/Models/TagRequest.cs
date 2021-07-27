using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssetControl.api.Models
{
    public class Transfer

    {
        [Key]
        public int Id { get; set; }


        public string PurchaseType { get; set; }


        public int? LineNumber { get; set; }


        public string DescriptionOfItem { get; set; }


        public int? UnspscCoding { get; set; }


        public string ContractNumber { get; set; }


        public string Make { get; set; }


        public string Model { get; set; }


        public double? Quantity { get; set; }


        public decimal? Cost { get; set; }


        public string PersonRequesting { get; set; }


        public DateTime? DateOfPurchase { get; set; }


        public string CardOwner { get; set; }


        public string Store { get; set; }



        public string Department { get; set; }



        public string EmailOfRequestor { get; set; }


        public string UserName { get; set; }


        public string Mailcode { get; set; }

    }

}
