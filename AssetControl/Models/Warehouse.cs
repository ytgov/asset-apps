using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssetControl.api.Models
{
    public class Warehouse

    {
        [Key]
        public int Id { get; set; }


        public int? Quantity { get; set; }


        public string To { get; set; }


        public string From { get; set; }


        public string Category { get; set; }



        public DateTime? Date { get; set; }


        public DateTime? DateofTransaction { get; set; }


        public string YTGNumber { get; set; }


        public string Uniquedonation { get; set; }


        public string MailCodeIn { get; set; }


        public string MailCodeOut { get; set; }


        public int? SubCategory { get; set; }


        public int? Area { get; set; }


       
        public int? StaffId { get; set; }

    }

}
