using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssetControl.api.Models
{
    public class TransferRequest

    {
        [Key]
        public int Id { get; set; }


        public string YtgNumber { get; set; }


        public DateTime? DateCurrent { get; set; }


        public DateTime? DateOfTransaction { get; set; }


        public string From { get; set; }


    }
}

