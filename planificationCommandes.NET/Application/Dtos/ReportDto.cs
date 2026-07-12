namespace planificationCommandesBackend.Application.Dtos
{

    public class DeadlineComplianceSummaryDto
    {
        public int TotalCommandes { get; set; }
        public int OnTime { get; set; }
        public int Late { get; set; }
        public int Pending { get; set; }  
        public double ComplianceRate { get; set; }   
        public double AverageDaysVariance { get; set; }  
        public List<DeadlineComplianceRowDto> Rows { get; set; } = [];
    }


    public class DeadlineComplianceRowDto
    {
        public int Id { get; set; }
        public string NumeroCommande { get; set; } = string.Empty;
        public DateTime DateExport { get; set; }   
        public DateTime? DateLivraison { get; set; }   
        public string Statut { get; set; } = string.Empty;
        public string NomRecette { get; set; } = string.Empty;
        public int Urgence { get; set; }
        public int Quantite { get; set; }

 
        public double? DaysVariance { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}