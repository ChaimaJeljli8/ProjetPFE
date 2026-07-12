import { Injectable, signal, computed } from '@angular/core';

export type Language = 'fr' | 'en';

export interface Translations {
  [key: string]: string;
  // Nav / General
  appName: string;
  tagline: string;
  getStarted: string;
  learnMore: string;
  login: string;
  signup: string;
  logout: string;
  myProfile: string;
  darkMode: string;
  lightMode: string;
  expandSidebar: string;
  collapseSidebar: string;
  adminRoleLabel: string;
  plannerRoleLabel: string;
  workerRoleLabel: string;
  usersNav: string;
  machinesNav: string;
  commandesNav: string;
  recettesNav: string;
  dashboardNav: string;
  // Form validation
  emailInvalid: string;
  passwordMin6: string;
  passwordMin8: string;
  pwdReqLength: string;
  pwdReqUpper: string;
  pwdReqDigit: string;
  pwdReqSpecial: string;
  pwdWeak: string;
  pwdMedium: string;
  pwdStrong: string;
  signingIn: string;
  // Landing
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  featuresTitle: string;
  featuresSubtitle: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  ctaTitle: string;
  ctaSubtitle: string;
  statsTitle: string;
  stat1Label: string;
  stat2Label: string;
  stat3Label: string;
  stat4Label: string;
  // Auth
  welcomeBack: string;
  signInDesc: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  rememberMe: string;
  forgotPassword: string;
  signIn: string;
  noAccount: string;
  createAccount: string;
  alreadyAccount: string;
  firstNameLabel: string;
  lastNameLabel: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  roleLabel: string;
  roleAdmin: string;
  rolePlanner: string;
  roleOperator: string;
  signupTitle: string;
  signupDesc: string;
  forgotTitle: string;
  forgotDesc: string;
  sendReset: string;
  backToLogin: string;
  resetSent: string;
  resetSentDesc: string;
  footerRights: string;
  footerPrivacy: string;
  footerTerms: string;
  footerContact: string;
  // Landing Page
  companyBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescLanding: string;
  employeesLabel: string;
  establishedLabel: string;
  experienceLabel: string;
  denimFlow: string;
  designLabel: string;
  preparationLabel: string;
  manufacturingLabel: string;
  finishingLabel: string;
  sustainableProduction: string;
  efficiencyLabel: string;
  jeansProduced: string;
  productionDelay: string;
  heritageTitle: string;
  heritageSubtitle: string;
  heritageDesc: string;
  sustainableManufacturing: string;
  sustainableManufacturingDesc: string;
  globalExport: string;
  globalExportDesc: string;
  companyFounded: string;
  majorExpansion: string;
  sustainabilityInitiative: string;
  digitalTransformation: string;
  digitalTransformationTitle: string;
  digitalTransformationSubtitle: string;
  smartSchedulingTitle: string;
  smartSchedulingDesc: string;
  resourceOptimizationTitle: string;
  resourceOptimizationDesc: string;
  realtimeMonitoringTitle: string;
  realtimeMonitoringDesc: string;
  sustainableAnalyticsTitle: string;
  sustainableAnalyticsDesc: string;
  joinWicMic: string;
  joinWicMicDesc: string;
  footerAddress: string;
  // Auth Layout
  authLayoutTitle: string;
  authLayoutDesc: string;
  authFeature1: string;
  authFeature2: string;
  authFeature3: string;
  // Reset password page
  resetTitle: string;
  resetDesc: string;
  newPasswordLabel: string;
  newPasswordPlaceholder: string;
  resetPassword: string;
  resetSuccessTitle: string;
  resetSuccessDesc: string;
  resetInvalidTitle: string;
  resetInvalidDesc: string;
  requestNewLink: string;
  // Google OAuth
  orContinueWith: string;
  orWithEmail: string;
  loginWithGoogle: string;
  registerWithGoogle: string;
  roleHint: string;
  googleCompleteTitle: string;
  googleCompleteDesc: string;
  choosePasswordLabel: string;
  googlePasswordHint: string;
  backToSignup: string;
  // Admin user management
  adminUsersTitle: string;
  usersTotal: string;
  addUser: string;
  searchUsers: string;
  nameCol: string;
  emailCol: string;
  roleCol: string;
  statusCol: string;
  actionsCol: string;
  activeStatus: string;
  inactiveStatus: string;
  statusLabel: string;
  createUserTitle: string;
  editUserTitle: string;
  leaveBlankPassword: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
  cancel: string;
  createBtn: string;
  saveBtn: string;
  deleteBtn: string;
  role_Admin: string;
  role_PlanificationResponsable: string;
  role_Worker: string;
  // Machine management
  machinesTitle: string;
  machinesTotal: string;
  machinesTotal_plural: string;
  addMachine: string;
  searchMachines: string;
  allTypes: string;
  allStatuts: string;
  statTotal: string;
  statAvailable: string;
  statMaintenance: string;
  statOutOfService: string;
  noMachinesTitle: string;
  noMachinesDesc: string;
  colMachine: string;
  colType: string;
  colCapacity: string;
  colSetup: string;
  colOperations: string;
  colStatut: string;
  colActions: string;
  noSearchResult: string;
  editMachineTitle: string;
  editMachineDesc: string;
  newMachineTitle: string;
  newMachineDesc: string;
  fieldCodeMachine: string;
  fieldNomMachine: string;
  fieldType: string;
  fieldStatut: string;
  fieldCapacity: string;
  fieldSetup: string;
  fieldOperations: string;
  fieldOperationsHint: string;
  fieldJourMaintenance: string;
  fieldFrequenceMaintenance: string;
  selectPlaceholder: string;
  updateBtn: string;
  createMachineBtn: string;
  deleteMachineTitle: string;
  deleteMachineDesc: string;
  machineCreated: string;
  machineUpdated: string;
  machineDeleted: string;
  machineCreateError: string;
  machineUpdateError: string;
  machineDeleteError: string;
  // Profile
  profileInfoTab: string;
  profilePasswordTab: string;
  profileInfoDesc: string;
  profilePasswordDesc: string;
  currentPasswordLabel: string;
  changePasswordBtn: string;
  photoLabel: string;
  dragDropPhoto: string;
  browsePhoto: string;
  removePhoto: string;
  completeProfileTitle: string;
  completeProfileDesc: string;
  confirmRole: string;
  savingProfile: string;
  roleAdminDesc: string;
  rolePlannerDesc: string;
  roleOperatorDesc: string;
  // Recette management
  recettesTitle: string;
  recettesSubtitle: string;
  recettesSubtitle_plural: string;
  addRecette: string;
  searchRecettes: string;
  statTotalRecettes: string;
  statTotalOps: string;
  statAvgDuration: string;
  statAvgDurationUnit: string;
  noRecettesTitle: string;
  noRecettesDesc: string;
  noSearchResultRecette: string;
  newRecetteTitle: string;
  newRecetteSubtitle: string;
  editRecetteTitle: string;
  editRecetteSubtitle: string;
  fieldNomRecette: string;
  fieldNomRecettePlaceholder: string;
  fieldDescription: string;
  fieldDescriptionPlaceholder: string;
  fieldDescriptionHint: string;
  opsSequenceLabel: string;
  addOpBtn: string;
  fieldMachine: string;
  fieldOperation: string;
  fieldDureeMin: string;
  fieldQteLot: string;
  chooseOpFirst: string;
  opsEmptyHint: string;
  deleteRecetteTitle: string;
  deleteRecetteDesc: string;
  recetteCreated: string;
  recetteUpdated: string;
  recetteDeleted: string;
  createRecetteBtn: string;
  updateRecetteBtn: string;
  badgeOps: string;
  badgeDuration: string;
  // Recette — operation confirm/remove dialog
  fieldChargementMin: string;
  fieldDecharementMin: string;
  removeOpTitle: string;
  confirmRemoveOpLabel: string;
  confirmRemoveOpYes: string;
  confirmRemoveOpNo: string;
  serverError: string;
  noUserFound: string;
  incorrectPassword: string;
  passwordChangedSuccess: string;
  genericError: string;
  // Planning page — general
  planningTitle: string;
  planningSubtitle: string;
  planningHistoryPlaceholder: string;
  planningRunBtn: string;
  planningRunning: string;
  planningExporting: string;
  planningOptimizing: string;
  planningOptimizingDesc: string;
  planningEmptyTitle: string;
  planningEmptyHint: string;
  planningKpiMakespan: string;
  planningKpiMakespanUnit: string;
  planningKpiCommandes: string;
  planningKpiLignes: string;
  planningKpiMachines: string;
  planningKpiOnTime: string;
  planningKpiDebut: string;
  planningFilterUrgence: string;
  planningFilterAll: string;
  planningFilterMachine: string;
  planningFilterMachinePlaceholder: string;
  planningFilterAllMachines: string;
  planningFilterCommande: string;
  planningFilterCommandePlaceholder: string;
  planningFilterAllCommandes: string;
  planningFilterZoom: string;
  planningCornerDay: string;
  planningCornerHour: string;
  planningOpLabel: string;
  planningTableTitle: string;
  planningTableLines: string;
  planningTableEmpty: string;
  planningColMachine: string;
  planningColCommande: string;
  planningColOperation: string;
  planningColStart: string;
  planningColEnd: string;
  planningColLoad: string;
  planningColCycle: string;
  planningColUnload: string;
  planningColLot: string;
  planningColPieces: string;
  planningColUrgence: string;
  planningColExport: string;
  planningDetailMachine: string;
  planningDetailStart: string;
  planningDetailEnd: string;
  planningDetailLoad: string;
  planningDetailCycle: string;
  planningDetailUnload: string;
  planningDetailLot: string;
  planningDetailPieces: string;
  planningDetailUrgence: string;
  planningDetailExportDate: string;
  planningDetailQty: string;
  // Planning page — run-options modal
  planningModalSubtitle: string;
  planningModalMachineLabel: string;
  planningModalMachineHint: string;
  planningModalMachineSingular: string;
  planningModalMachinePlural: string;
  planningModalInfo1: string;
  planningModalInfoN1: string;
  planningModalInfoN2: string;
  planningMachineDesc1: string;
  planningMachineDesc2: string;
  planningMachineDesc3: string;
  // Planning page — modal start datetime (i18n for hardcoded FR strings)
  planningModalStartLabel: string;
  planningModalStartHint: string;
  planningModalNow: string;
  planningModalStartPreview: string;
  // Planning page — late chip
  planningLateChip: string;
  planningLateNoticeTitle: string;
  // Planning page — makespan formatted
  planningKpiMakespanDay: string;
  planningKpiMakespanHour: string;
  // Planning page — specific error messages
  planningErrNoCommandes: string;
  planningErrNoMachines: string;
  planningErrNoRecettes: string;
  planningErrTimeout: string;
  planningErrInfeasible: string;
  planningErrServer: string;
  planningErrUnauthorized: string;
  planningErrForbidden: string;
  planningErrNotFound: string;
  planningErrUnprocessable: string;
  planningErrRateLimit: string;
  planningErrNetwork: string;
  planningErrExcelEmpty: string;
  planningErrPdfEmpty: string;
  planningErrExcelServer: string;
  planningErrPdfServer: string;
  planningSuccessRun: string;
  planningWarnInsufficientLots: string;
  planningWarnNotEnoughMachines: string;
  planningErrNotEnoughMachines: string;
  // Commande management
  commandesTitle: string;
  commandesSubtitle: string;
  commandesSubtitle_plural: string;
  addCommande: string;
  importCsv: string;
  statPending: string;
  statInProgress: string;
  statUrgence1: string;
  searchCommandes: string;
  filterUrgencePlaceholder: string;
  filterAllStatuts: string;
  filterAllRecettes: string;
  colNumeroCommande: string;
  colDateExport: string;
  colUrgence: string;
  colQuantite: string;
  colRecette: string;
  noCommandesTitle: string;
  noCommandesDesc: string;
  noCommandesSearchResult: string;
  retryBtn: string;
  createCommandeTitle: string;
  createCommandeSubtitle: string;
  editCommandeTitle: string;
  editCommandeSubtitle: string;
  fieldNumeroCommande: string;
  fieldNumeroCommandePlaceholder: string;
  fieldDateExport: string;
  fieldUrgence: string;
  fieldUrgenceHint: string;
  fieldQuantite: string;
  fieldQuantitePlaceholder: string;
  fieldRecette: string;
  fieldRecettePlaceholder: string;
  createCommandeBtn: string;
  updateCommandeBtn: string;
  deleteCommandeTitle: string;
  deleteCommandeDesc: string;
  commandeCreated: string;
  commandeUpdated: string;
  commandeDeleted: string;
  commandeDeleteError: string;
  importCommandesTitle: string;
  importCommandesSubtitle: string;
  csvHintColumns: string;
  dropZoneText: string;
  dropZoneOr: string;
  browseFiles: string;
  changeFile: string;
  importingBtn: string;
  importBtn: string;
  importedCount: string;
  skippedCount: string;
  recetteOps: string;
  recetteMins: string;
  closeBtn: string;
  // Admin planning page
  sectionOverview: string;
  sectionGestion: string;
  adminPlanificationNav: string;
  adminPlanningTitle: string;
  adminPlanningSubtitle: string;
  adminPlanningEmpty: string;
  adminPlanningEmptyHint: string;
  adminGanttTitle: string;
  adminKpiPlannings: string;
  adminKpiCommandes: string;
  adminKpiOptimal: string;
  adminFilterTitle: string;
  adminFilterDateFrom: string;
  adminFilterDateTo: string;
  adminFilterMakespan: string;
  adminFilterCommande: string;
  adminFilterReset: string;
  adminFilteredLabel: string;
  // Worker planning page
  workerPlanningTitle: string;
  workerPlanningSubtitle: string;
  workerPlanningEmpty: string;
  workerPlanningEmptyHint: string;
  workerPlanningLoading: string;
  workerGanttTitle: string;
  workerKpiPlannings: string;
  // Dashboard — KPI pills & labels
  kpiAttente: string;
  kpiTerminees: string;
  kpiEnRetard: string;
  kpiAucunRetard: string;
  kpiAchevement: string;
  kpiOperationnelles: string;
  kpiOperations: string;
  kpiOpsParRecette: string;
  kpiAdmin: string;
  kpiPlanif: string;
  kpiOperat: string;
  kpiTotal: string;
  kpiUtilisateurs: string;
  kpiPrioriteMax: string;
  kpiLabelCommandes: string;
  kpiLabelUrgences: string;
  kpiLabelMachines: string;
  kpiLabelPlannings: string;
  kpiLabelRecettes: string;
  kpiLabelUsers: string;
  // Dashboard — chart titles & filters
  chartCommandesStatut: string;
  chartRepartitionUsers: string;
  chartEvolutionPlannings: string;
  chartEtatMachines: string;
  chartDistributionUrgences: string;
  chartTopRecettes: string;
  filter5Last: string;
  filter10Last: string;
  filterAll: string;
  filterFonctionnel: string;
  filterNonFonctionnel: string;
  filterTop5: string;
  filterTop10: string;
  opsIndexTitle: string;
  dashboardLoadError: string;
  // Chart axes, labels & tooltips
  chartRoleAdmins: string;
  chartRolePlanners: string;
  chartRoleOperators: string;
  chartRoleOthers: string;
  chartAxisMachines: string;
  chartAxisNombreMachines: string;
  chartAxisNombreCommandes: string;
  chartAxisUrgence: string;
  chartAxisRecette: string;
  chartPctDuParc: string;
  chartPctDuTotal: string;
  chartUrgenceLabel: string;
  chartTooltipCommandes: string;
  chartRecettePrefix: string;
  chartRecetteInconnue: string;
  // Statut values (API always returns French — translated for chart display)
  statutEnAttente: string;
  statutEnCours: string;
  statutTermine: string;
  statutAnnule: string;
  statutInconnu: string;
  // Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  dashboardRefresh: string;
  dashboardWelcomeHint: string;
  dashboardGreetingMorning: string;
  dashboardGreetingAfternoon: string;
  dashboardGreetingEvening: string;
  dashboardMakespanAvg: string;
  dashboardMakespanDays: string;
  dashboardCommandesPlanifiees: string;
  dashboardAxisPlanning: string;
  dashboardAxisMakespan: string;
  dashboardAxisCommandes: string;
  dashboardAxisMakespanH: string;
  dashboardAxisMakespanMin: string;
  dashboardMakespanHours: string;
  dashboardMakespanMin: string;
  // Chatbot
  chatbotTitle:            string;
  chatbotSubtitle:         string;
  chatbotEmptyHint:        string;
  chatbotSugg1:            string;
  chatbotSugg2:            string;
  chatbotSugg3:            string;
  chatbotInputPlaceholder: string;
  chatbotToggleTitle:      string;
  chatbotClearTitle:       string;
  // Locale helper (used by Intl.DateTimeFormat)
  appLocale: string;
  // Planner dashboard — banner & header
  plannerDashBannerRole: string;
  plannerDashTitle: string;
  plannerDashSubtitle: string;
  plannerDefaultName: string;
  // Planner dashboard — KPI labels
  plannerKpiPlanifEfficacite: string;
  plannerKpiPlanningsCount: string;
  plannerKpiOptimal: string;
  plannerKpiNormal: string;
  plannerKpiMakespanMoyen: string;
  plannerKpiDureeMoyenne: string;
  plannerKpiChargeMachine: string;
  plannerKpiEnAttente: string;
  plannerKpiAvancee: string;
  plannerKpiUrgences: string;
  plannerKpiActionRequise: string;
  plannerKpiAucuneUrgence: string;
  plannerKpiQualitePlannings: string;
  plannerKpiValides: string;
  plannerKpiEnRegle: string;
  // Planner dashboard — chart titles & badges
  plannerChartEvolution: string;
  plannerChartTotalBadge: string;
  plannerChartChargeMachine: string;
  plannerChartMachinesBadge: string;
  plannerChartMakespan: string;
  plannerChartMakespanBadge: string;
  plannerChartTopRecettes: string;
  // Planner dashboard — chart internals
  plannerChartMakespanDataset: string;
  plannerChartAxisDuree: string;
  plannerChartCharge: string;
  plannerMakespanRange1: string;
  plannerMakespanRange2: string;
  plannerMakespanRange3: string;
  plannerMakespanRange4: string;
  plannerMakespanRange5: string;
  plannerMakespanDataset: string;
  plannerMakespanAxisX: string;
  plannerMakespanPctDuTotal: string;
  plannerRecetteDataset: string;
  plannerRecetteCommandeSuffix: string;
  // Planner dashboard — ops detail panel
  plannerOpsSelectPlaceholder: string;
  plannerOpsOperationSuffix: string;
  plannerOpsTotal: string;
  plannerOpsPctDureeMax: string;
  plannerOpsEmptyHint: string;
  // Worker dashboard — KPI labels
  workerDashAvailablePlannings: string;
  workerDashLastPlanning: string;
  workerDashNoPlannings: string;
  workerDashAssignedTasks: string;
  workerDashOrders: string;
  workerDashProductionDuration: string;
  workerDashFullDays: string;
  workerDashLessThanADay: string;
  workerDashPlanningStatus: string;
  workerDashActivePlanning: string;
  // Worker dashboard — error & empty states
  workerDashLoadError: string;
  workerDashLoadErrorHint: string;
  workerDashRetry: string;
  workerDashNoPlanningAvailable: string;
  workerDashNoPlanningHint: string;
  workerDashTableEmpty: string;
  // Worker dashboard — chart card titles & badges
  workerDashChartMachineLoad: string;
  workerDashBadgeOps: string;
  workerDashChartMakespan: string;
  workerDashBadgeDays: string;
  workerDashChartOrders: string;
  workerDashBadgeQty: string;
  workerDashChartHistory: string;
  // Worker dashboard — history filter options
  workerDashFilterAll: string;
  workerDashFilter10: string;
  workerDashFilter20: string;
  // Worker dashboard — table headers
  workerDashColId: string;
  workerDashColDate: string;
  workerDashColOrders: string;
  workerDashColLines: string;
  workerDashColStatus: string;
  // Worker dashboard — chart internals
  workerDashAxisOps: string;
  workerDashDatasetMakespan: string;
  workerDashAxisPlanningNum: string;
  workerDashAxisMakespanDays: string;
  workerDashDatasetOrders: string;
  workerDashAxisOrderCount: string;
  // Worker dashboard — shift labels
  workerDashShiftBefore: string;
  workerDashShiftMorning: string;
  workerDashShiftLunch: string;
  workerDashShiftAfternoon: string;
  workerDashShiftEnd: string;
  // Worker dashboard — clock sub-label
  workerDashClockDayPct: string;
  // Planner dashboard — extra KPI labels
  plannerKpiEnAttenteLabel: string;
  plannerKpiTotalPlannings: string;
  plannerKpiMoyenne: string;
  plannerKpiActifs: string;
  // Planner dashboard — delay alerts panel
  alertsTitle: string;
  alertsBadgeSuffix: string;
  alertsCriticalBadge: string;
  alertsFilterAll: string;
  alertsFilterCritical: string;
  alertsFilterWarning: string;
  alertsFilterInfo: string;
  alertsDismissAll: string;
  alertsSeverityCritical: string;
  alertsSeverityWarning: string;
  alertsSeverityInfo: string;
  alertsExportLabel: string;
  alertsOverdueBy: string;
  alertsDaysLeft: string;
  alertsUrgent: string;
  alertsDismissOne: string;
  alertsAllClear: string;
  alertsMsgOverdue: string;
  alertsMsgDueToday: string;
  alertsMsgWarning: string;
  alertsMsgInfo: string;
  // Planner dashboard — bottleneck notification panel
  notifPanelTitle: string;
  notifFilterAll: string;
  notifFilterOverloaded: string;
  notifFilterUnderused: string;
  notifFilterInactive: string;
  notifTagOverloaded: string;
  notifTagUnderused: string;
  notifTagInactive: string;
  notifDismissTitle: string;
  notifEmpty: string;
  notifFooterOverloaded: string;
  notifFooterUnderused: string;
  notifFooterInactive: string;
  notifFooterBalanced: string;
  notifDismissAll: string;
  notifClose: string;
  notifMsgOverloaded: string;
  notifMsgUnderused:  string;
  notifMsgInactive:   string;
  // Admin users — additional keys
  clearSearch: string;
  passwordMismatch: string;
  saving: string;
  deleteUserTitle: string;
  deleteUserConfirm: string;
  cancelBtn: string;
  deleting: string;
  // Planner dashboard — deadline-compliance report section
  complianceSectionTitle: string;
  complianceSectionSubtitle: string;
  complianceDateFrom: string;
  complianceDateTo: string;
  complianceRunBtn: string;
  complianceRunningBtn: string;
  complianceKpiRate: string;
  complianceKpiOnTime: string;
  complianceKpiLate: string;
  complianceKpiPending: string;
  complianceKpiVariance: string;
  complianceVarianceAhead: string;
  complianceVarianceBehind: string;
  complianceChartTitle: string;
  complianceChartBadge: string;
  complianceTableTitle: string;
  complianceFilterAll: string;
  complianceFilterOnTime: string;
  complianceFilterLate: string;
  complianceFilterPending: string;
  complianceColCommande: string;
  complianceColRecette: string;
  complianceColDateExport: string;
  complianceColVariance: string;
  complianceColStatut: string;
  complianceRowEmpty: string;
  complianceEmptyHint: string;
  complianceLoadError: string;
  complianceBadgeOnTime: string;
  complianceBadgeLate: string;
  complianceBadgePending: string;
  complianceChartLabelOnTime: string;
  complianceChartLabelLate: string;
  complianceChartLabelPending: string;
  complianceTooltipSuffix: string;
// Alert / bottleneck error messages
  alertErrNetwork:            string;  // server unreachable (status 0)
  alertErrUnauthorized:       string;  // 401
  alertErrForbidden:          string;  // 403
  alertErrNotFound:           string;  // 404
  alertErrServer:             string;  // 500 / 502 / 503
  alertErrRefreshFailed:      string;  // POST /refresh failed
  alertErrDismissFailed:      string;  // PATCH /{id}/dismiss failed
  alertErrDismissAllDelay:    string;  // PATCH /dismiss-all/delay failed
  alertErrDismissAllBottleneck: string; // PATCH /dismiss-all/bottleneck failed
  alertErrLoadFailed:         string;  // GET /api/Alerts failed on page load

}

const FR: Translations = {
  appName: 'DenimPlanner',
  tagline: 'Planification intelligente',
  getStarted: 'Commencer',
  learnMore: 'En savoir plus',
  login: 'Connexion',
  signup: "S'inscrire",
  logout: 'Déconnexion',
  myProfile: 'Mon profil',
  darkMode: 'Mode sombre',
  lightMode: 'Mode clair',
  expandSidebar: 'Agrandir',
  collapseSidebar: 'Réduire',
  adminRoleLabel: 'Administrateur',
  plannerRoleLabel: 'Responsable Planification',
  workerRoleLabel: 'Travailleur',
  usersNav: 'Utilisateurs',
  machinesNav: 'Machines',
  commandesNav: 'Commandes',
  recettesNav: 'Recettes',
  dashboardNav: 'Tableau de bord',
  emailInvalid: 'Adresse e-mail invalide',
  passwordMin6: 'Minimum 6 caractères',
  passwordMin8: 'Minimum 8 caractères',
  pwdReqLength: '8 caractères minimum',
  pwdReqUpper: 'Une lettre majuscule',
  pwdReqDigit: 'Un chiffre (0–9)',
  pwdReqSpecial: 'Un caractère spécial (!@#$…)',
  pwdWeak: 'Faible',
  pwdMedium: 'Moyen',
  pwdStrong: 'Fort',
  signingIn: 'Connexion en cours...',
  heroTitle: 'Planification optimisée de production',
  heroSubtitle: "pour l'industrie du Denim",
  heroDescription: "Système intelligent basé sur Google OR-Tools pour la gestion multi-contraintes des commandes de production denim. Optimisez vos lignes de fabrication avec précision.",
  featuresTitle: 'Fonctionnalités clés',
  featuresSubtitle: 'Une solution complète pour la planification industrielle',
  feature1Title: 'Optimisation OR-Tools',
  feature1Desc: "Algorithmes avancés de planification utilisant Google OR-Tools pour résoudre des problèmes d'ordonnancement complexes en temps réel.",
  feature2Title: 'Gestion multi-contraintes',
  feature2Desc: "Gestion simultanée des contraintes de capacité, délais, ressources humaines et matériaux pour une planification réaliste.",
  feature3Title: 'Tableau de bord analytique',
  feature3Desc: "Visualisations en temps réel de la charge des machines, avancement des commandes et indicateurs de performance clés.",
  ctaTitle: 'Prêt à optimiser votre production ?',
  ctaSubtitle: "Rejoignez les industriels qui ont transformé leur chaîne de production",
  statsTitle: 'Résultats prouvés',
  stat1Label: 'Réduction des délais',
  stat2Label: 'Efficacité accrue',
  stat3Label: 'Commandes planifiées',
  stat4Label: 'Clients satisfaits',
  welcomeBack: 'Bon retour',
  signInDesc: 'Connectez-vous à votre espace de planification',
  emailLabel: 'Adresse e-mail',
  emailPlaceholder: 'votre@email.com',
  passwordLabel: 'Mot de passe',
  passwordPlaceholder: '••••••••',
  rememberMe: 'Se souvenir de moi',
  forgotPassword: 'Mot de passe oublié ?',
  signIn: 'Se connecter',
  noAccount: "Pas encore de compte ?",
  createAccount: 'Créer un compte',
  alreadyAccount: 'Déjà un compte ?',
  firstNameLabel: 'Prénom',
  lastNameLabel: 'Nom',
  confirmPassword: 'Confirmer le mot de passe',
  confirmPasswordPlaceholder: '••••••••',
  roleLabel: 'Rôle',
  roleAdmin: 'Administrateur',
  rolePlanner: 'Planificateur',
  roleOperator: 'Opérateur',
  signupTitle: 'Créer un compte',
  signupDesc: 'Rejoignez la plateforme de planification',
  forgotTitle: 'Récupération du mot de passe',
  forgotDesc: 'Entrez votre e-mail pour recevoir un lien de réinitialisation',
  sendReset: 'Envoyer le lien',
  backToLogin: 'Retour à la connexion',
  resetSent: 'E-mail envoyé',
  resetSentDesc: 'Vérifiez votre boîte mail pour le lien de réinitialisation.',
  footerRights: 'Tous droits réservés',
  footerPrivacy: 'Politique de confidentialité',
  footerTerms: "Conditions d'utilisation",
  footerContact: 'Contact',
  companyBadge: 'Depuis 1990 • Ras Jebal, Bizerte',
  heroTitleLine1: 'WIC MIC GROUPE ',
  heroTitleLine2: 'Nous produisons le jean durablement',
  heroDescLanding: "Depuis 2013, nous avons changé de mentalité pour faire partie de la nouvelle génération de producteurs alliant industrie et conscience. Zéro rejet d'eau, Laser & Ozone, faible empreinte carbone — la mode et la durabilité réunies dans chaque pièce.",
  employeesLabel: 'Employés Dédiés',
  establishedLabel: "Années d'Excellence",
  experienceLabel: "Années d'Expérience",
  denimFlow: 'Flux de Production Denim',
  designLabel: 'Conception',
  preparationLabel: 'Préparation',
  manufacturingLabel: 'Fabrication',
  finishingLabel: 'Finition',
  sustainableProduction: 'Production Durable',
  efficiencyLabel: 'Efficacité',
  jeansProduced: 'Jeans Produits',
  productionDelay: 'Délai de Production',
  heritageTitle: 'NOTRE PATRIMOINE',
  heritageSubtitle: "Trois Décennies d'Excellence Textile",
  heritageDesc: "Depuis 1990, WIC MIC GROUP est à l'avant-garde de l'industrie textile tunisienne, spécialisée dans la production de jeans denim premium. Depuis notre base à Beni Atta, Bizerte, nous sommes devenus l'un des plus grands groupes textiles de Tunisie, intégrant des pratiques durables avec une fabrication innovante.",
  sustainableManufacturing: 'Fabrication Durable',
  sustainableManufacturingDesc: 'Investissements importants dans les initiatives environnementales et la production responsable.',
  globalExport: 'Export Mondial',
  globalExportDesc: 'Conception, préparation, finition et exportation de textiles et accessoires dans le monde entier.',
  companyFounded: 'Entreprise Fondée',
  majorExpansion: 'Expansion Majeure',
  sustainabilityInitiative: 'Initiative de Durabilité',
  digitalTransformation: 'Transformation Numérique',
  digitalTransformationTitle: 'TRANSFORMATION NUMÉRIQUE',
  digitalTransformationSubtitle: "Révolutionner la Production de Denim avec l'IA",
  smartSchedulingTitle: 'Planification de Production Intelligente',
  smartSchedulingDesc: 'Optimisation assistée par IA de nos lignes de production denim utilisant Google OR-Tools pour une efficacité maximale.',
  resourceOptimizationTitle: 'Optimisation des Ressources',
  resourceOptimizationDesc: "Allocation intelligente de nos 1 900+ employés et machines dans les départements de conception, préparation et finition.",
  realtimeMonitoringTitle: 'Surveillance en Temps Réel',
  realtimeMonitoringDesc: "Suivi en direct des métriques de production et de l'efficacité à travers toutes les étapes de fabrication.",
  sustainableAnalyticsTitle: 'Analytique Durable',
  sustainableAnalyticsDesc: "Suivi de l'impact environnemental et des métriques de durabilité alignés avec nos engagements écologiques.",
  joinWicMic: 'Rejoignez la Révolution de WIC MIC GROUP',
  joinWicMicDesc: 'Découvrez comment notre plateforme DenimPlanner peut transformer votre production',
  footerAddress: 'Beni Atta, Ras Jebal, Bizerte, Tunisie',
  authLayoutTitle: 'Système de planification optimisée du Denim',
  authLayoutDesc: 'Propulsé par Google OR-Tools pour une gestion multi-contraintes précise et efficace de vos commandes de production.',
  authFeature1: 'Ordonnancement multi-machines optimisé',
  authFeature2: 'Gestion des délais et contraintes',
  authFeature3: 'Tableau de bord en temps réel',
  resetTitle: 'Nouveau mot de passe',
  resetDesc: 'Choisissez un mot de passe fort pour sécuriser votre compte.',
  newPasswordLabel: 'Nouveau mot de passe',
  newPasswordPlaceholder: 'Minimum 8 caractères',
  resetPassword: 'Réinitialiser le mot de passe',
  resetSuccessTitle: 'Mot de passe modifié !',
  resetSuccessDesc: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
  resetInvalidTitle: 'Lien invalide ou expiré',
  resetInvalidDesc: 'Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.',
  requestNewLink: 'Demander un nouveau lien',
  orContinueWith: 'ou continuer avec',
  orWithEmail: "ou s'inscrire avec un email",
  loginWithGoogle: 'Se connecter avec Google',
  registerWithGoogle: "S'inscrire avec Google",
  roleHint: "(s'applique aussi à l'inscription Google)",
  googleCompleteTitle: 'Finalisez votre inscription',
  googleCompleteDesc: 'Choisissez votre rôle et créez un mot de passe pour accéder aussi par email.',
  choosePasswordLabel: 'Créer un mot de passe',
  googlePasswordHint: '(pour se connecter par email aussi)',
  backToSignup: "Retour à l'inscription",
  adminUsersTitle: 'Gestion des utilisateurs',
  usersTotal: 'utilisateurs',
  addUser: 'Ajouter un utilisateur',
  searchUsers: 'Rechercher...',
  nameCol: 'Nom',
  emailCol: 'Email',
  roleCol: 'Rôle',
  statusCol: 'Statut',
  actionsCol: 'Actions',
  activeStatus: 'Actif',
  inactiveStatus: 'Inactif',
  statusLabel: 'Statut',
  createUserTitle: 'Créer un utilisateur',
  editUserTitle: "Modifier l'utilisateur",
  leaveBlankPassword: '(laisser vide pour ne pas changer)',
  deleteConfirmTitle: "Supprimer l'utilisateur ?",
  deleteConfirmDesc: 'Cette action est irréversible.',
  cancel: 'Annuler',
  createBtn: 'Créer',
  saveBtn: 'Enregistrer',
  deleteBtn: 'Supprimer',
  role_Admin: 'Administrateur',
  role_PlanificationResponsable: 'Responsable Planification',
  role_Worker: 'Travailleur',
  machinesTitle: 'Gestion des Machines',
  machinesTotal: 'machine configurée',
  machinesTotal_plural: 'machines configurées',
  addMachine: 'Nouvelle Machine',
  searchMachines: 'Rechercher par code ou nom...',
  allTypes: 'Tous les types',
  allStatuts: 'Tous les statuts',
  statTotal: 'Total',
  statAvailable: 'Disponibles',
  statMaintenance: 'Maintenance',
  statOutOfService: 'Hors service',
  noMachinesTitle: 'Aucune machine configurée',
  noMachinesDesc: 'Ajoutez votre première machine pour commencer.',
  colMachine: 'Machine',
  colType: 'Type',
  colCapacity: 'Capacité',
  colSetup: 'Setup',
  colOperations: 'Opérations',
  colStatut: 'Statut',
  colActions: 'Actions',
  noSearchResult: 'Aucune machine ne correspond à votre recherche.',
  editMachineTitle: 'Modifier la Machine',
  editMachineDesc: 'Modifiez les informations de la machine',
  newMachineTitle: 'Nouvelle Machine',
  newMachineDesc: 'Renseignez les informations de la nouvelle machine',
  fieldCodeMachine: 'Code Machine',
  fieldNomMachine: 'Nom de la Machine',
  fieldType: 'Type',
  fieldStatut: 'Statut',
  fieldCapacity: 'Capacité',
  fieldSetup: 'Temps Setup',
  fieldOperations: 'Opérations Possibles',
  fieldOperationsHint: "— utilisé par l'optimiseur",
  fieldJourMaintenance: 'Jour de Maintenance',
  fieldFrequenceMaintenance: 'Fréquence Maintenance',
  selectPlaceholder: 'Sélectionner...',
  updateBtn: 'Mettre à jour',
  createMachineBtn: 'Créer la machine',
  deleteMachineTitle: 'Supprimer la machine ?',
  deleteMachineDesc: "Cette action est irréversible. Le module d'optimisation ne pourra plus utiliser cette machine.",
  machineCreated: 'Machine créée ✓',
  machineUpdated: 'Machine mise à jour ✓',
  machineDeleted: 'Machine supprimée ✓',
  machineCreateError: 'Erreur lors de la création',
  machineUpdateError: 'Erreur lors de la mise à jour',
  machineDeleteError: 'Erreur lors de la suppression',
  profileInfoTab: 'Informations personnelles',
  profilePasswordTab: 'Mot de passe',
  profileInfoDesc: 'Modifiez vos informations de profil.',
  profilePasswordDesc: 'Changez votre mot de passe de connexion.',
  currentPasswordLabel: 'Mot de passe actuel',
  changePasswordBtn: 'Changer le mot de passe',
  photoLabel: 'Photo de profil',
  dragDropPhoto: 'Glissez une photo ici, ou',
  browsePhoto: 'parcourir',
  removePhoto: 'Supprimer la photo',
  completeProfileTitle: 'Choisissez votre rôle',
  completeProfileDesc: 'Bienvenue, ',
  confirmRole: 'Confirmer et accéder',
  savingProfile: 'Sauvegarde en cours...',
  roleAdminDesc: 'Accès complet — gestion des utilisateurs, rôles et configuration système.',
  rolePlannerDesc: 'Planification et ordonnancement des commandes de production denim.',
  roleOperatorDesc: 'Suivi et exécution des tâches sur les lignes de fabrication.',
  recettesTitle: 'Gestion des Recettes',
  recettesSubtitle: 'recette configurée',
  recettesSubtitle_plural: 'recettes configurées',
  addRecette: 'Nouvelle Recette',
  searchRecettes: 'Rechercher par nom de recette...',
  statTotalRecettes: 'Total recettes',
  statTotalOps: 'Opérations totales',
  statAvgDuration: 'Durée moy. recette',
  statAvgDurationUnit: 'min',
  noRecettesTitle: 'Aucune recette configurée',
  noRecettesDesc: "Créez votre première recette pour l'associer aux commandes.",
  noSearchResultRecette: 'Aucune recette ne correspond à votre recherche.',
  newRecetteTitle: 'Nouvelle Recette',
  newRecetteSubtitle: 'Définissez la gamme opératoire de fabrication',
  editRecetteTitle: 'Modifier la Recette',
  editRecetteSubtitle: "Modifiez la séquence d'opérations",
  fieldNomRecette: 'Nom de la recette',
  fieldNomRecettePlaceholder: 'ex: 33115',
  fieldDescription: 'Description',
  fieldDescriptionPlaceholder: 'ex: Traitement eau',
  fieldDescriptionHint: '(optionnel)',
  opsSequenceLabel: "Séquence d'opérations",
  addOpBtn: 'Ajouter une opération',
  fieldMachine: 'Machine',
  fieldOperation: 'Opération',
  fieldDureeMin: 'Durée (min)',
  fieldQteLot: 'Qté Lot',
  chooseOpFirst: "Choisir machine d'abord",
  opsEmptyHint: 'Aucune opération. Cliquez sur "Ajouter une opération".',
  deleteRecetteTitle: 'Supprimer la recette ?',
  deleteRecetteDesc: 'Impossible si des commandes utilisent cette recette.',
  recetteCreated: 'Recette créée ✓',
  recetteUpdated: 'Recette mise à jour ✓',
  recetteDeleted: 'Recette supprimée ✓',
  createRecetteBtn: 'Créer la recette',
  updateRecetteBtn: 'Mettre à jour',
  badgeOps: 'opération(s)',
  badgeDuration: 'min total',
  // Recette — operation confirm/remove dialog
  fieldChargementMin: 'Charg. (min)',
  fieldDecharementMin: 'Décharg. (min)',
  removeOpTitle: "Supprimer l'opération",
  confirmRemoveOpLabel: 'Voulez-vous vraiment supprimer cette opération ?',
  confirmRemoveOpYes: 'Supprimer',
  confirmRemoveOpNo: 'Annuler',
  serverError: 'Impossible de contacter le serveur.',
  noUserFound: 'Aucun utilisateur trouvé pour',
  incorrectPassword: 'Mot de passe incorrect',
  passwordChangedSuccess: 'Mot de passe modifié avec succès.',
  genericError: 'Une erreur est survenue.',
  // ── Planning page — general ───────────────────────────────────────────────
  planningTitle: 'Planning de Production',
  planningSubtitle: 'Ordonnancement CP-SAT multi-contraintes',
  planningHistoryPlaceholder: 'Historique plannings…',
  planningRunBtn: "Lancer l'optimisation",
  planningRunning: 'Optimisation…',
  planningExporting: 'Export…',
  planningOptimizing: 'Optimisation CP-SAT en cours…',
  planningOptimizingDesc: "LNS → CP-SAT. Cela peut prendre jusqu'à 120 secondes.",
  planningEmptyTitle: 'Aucun planning généré',
  planningEmptyHint: 'Cliquez sur "Lancer l\'optimisation" pour démarrer le solveur CP-SAT.',
  planningKpiMakespan: 'Makespan',
  planningKpiMakespanUnit: 'j',
  planningKpiCommandes: 'Commandes',
  planningKpiLignes: 'Lignes Gantt',
  planningKpiMachines: 'Machines actives',
  planningKpiOnTime: 'Dans les délais',
  planningKpiDebut: 'Début planif.',
  planningFilterUrgence: 'Urgence :',
  planningFilterAll: 'Tous',
  planningFilterMachine: 'Machine :',
  planningFilterMachinePlaceholder: 'Filtrer machine…',
  planningFilterAllMachines: 'Toutes les machines',
  planningFilterCommande: 'Commande :',
  planningFilterCommandePlaceholder: 'Filtrer commande…',
  planningFilterAllCommandes: 'Toutes les commandes',
  planningFilterZoom: 'Zoom :',
  planningCornerDay: 'Jour',
  planningCornerHour: 'Heure',
  planningOpLabel: 'op.',
  planningTableTitle: 'Opérations planifiées',
  planningTableLines: 'lignes',
  planningTableEmpty: 'Aucune ligne pour ces filtres.',
  planningColMachine: 'Machine',
  planningColCommande: 'Commande',
  planningColOperation: 'Opération',
  planningColStart: 'Début',
  planningColEnd: 'Fin',
  planningColLoad: 'Charg.',
  planningColCycle: 'Cycle',
  planningColUnload: 'Décharg.',
  planningColLot: 'Lot',
  planningColPieces: 'Pièces',
  planningColUrgence: 'Urgence',
  planningColExport: 'Export',
  planningDetailMachine: 'Machine',
  planningDetailStart: 'Début',
  planningDetailEnd: 'Fin',
  planningDetailLoad: 'Chargement',
  planningDetailCycle: 'Cycle',
  planningDetailUnload: 'Déchargement',
  planningDetailLot: 'Lot',
  planningDetailPieces: 'Pièces',
  planningDetailUrgence: 'Urgence',
  planningDetailExportDate: 'Date export',
  planningDetailQty: 'Quantité totale',
  // ── Planning page — run-options modal ────────────────────────────────────
  planningModalSubtitle: "Configurez les paramètres d'optimisation",
  planningModalMachineLabel: 'Machines par opération',
  planningModalMachineHint: "Choisissez combien de machines peuvent traiter en parallèle les lots d'une même opération.",
  planningModalMachineSingular: 'machine',
  planningModalMachinePlural: 'machines',
  planningModalInfo1: "Comportement par défaut : tous les lots d'une opération sont traités séquentiellement sur une seule machine.",
  planningModalInfoN1: 'Les lots seront distribués équitablement entre les ',
  planningModalInfoN2: " disponibles pour chaque type d'opération. Si une opération ne dispose que d'une seule machine dans l'atelier, un avertissement sera affiché après l'optimisation.",
  planningMachineDesc1: 'Tous les lots sur une seule machine',
  planningMachineDesc2: 'Lots répartis sur 2 machines',
  planningMachineDesc3: 'Lots répartis sur 3 machines',
  // Planning page — modal start datetime
  planningModalStartLabel: 'Début du planning',
  planningModalStartHint: "Choisissez la date et l'heure à laquelle la production doit démarrer. Par défaut : maintenant.",
  planningModalNow: 'Maintenant',
  planningModalStartPreview: 'Démarrage planifié :',
  // Planning page — late chip
  planningLateChip: 'Hors délai',
  planningLateNoticeTitle: 'Commandes hors délai',
  // ── Planning page — makespan formatted ──────────────────────────────────
  planningKpiMakespanDay: 'j',
  planningKpiMakespanHour: 'h',
  // ── Planning page — specific error messages ──────────────────────────────
  planningErrNoCommandes: 'Aucune commande à planifier. Créez ou importez des commandes avant de lancer le solveur.',
  planningErrNoMachines: 'Aucune machine disponible. Vérifiez que des machines sont configurées et en service.',
  planningErrNoRecettes: 'Certaines commandes n\'ont pas de recette associée. Associez une recette à chaque commande.',
  planningErrTimeout: 'Le solveur CP-SAT a dépassé le délai maximum (120 s). Réduisez le nombre de commandes ou élargissez les contraintes.',
  planningErrInfeasible: 'Aucune solution réalisable trouvée. Les contraintes sont trop restrictives — vérifiez les capacités machines et les dates d\'export.',
  planningErrServer: 'Erreur interne du serveur (500). Contactez l\'administrateur si le problème persiste.',
  planningErrUnauthorized: 'Session expirée ou non authentifié (401). Reconnectez-vous et réessayez.',
  planningErrForbidden: 'Accès refusé (403). Votre compte n\'a pas les droits pour lancer l\'optimisation.',
  planningErrNotFound: 'Ressource introuvable (404). Vérifiez que les commandes et recettes existent toujours.',
  planningErrUnprocessable: 'Données invalides (422). Vérifiez les recettes et capacités des machines.',
  planningErrRateLimit: 'Trop de requêtes (429). Attendez quelques secondes avant de relancer l\'optimisation.',
  planningErrNetwork: 'Impossible de joindre le serveur d\'optimisation. Vérifiez votre connexion réseau.',
  planningErrExcelEmpty: 'Aucune donnée à exporter. Générez un planning avant de télécharger le fichier Excel.',
  planningErrPdfEmpty: 'Le serveur est inaccessible. Veuillez réessayer ultérieurement.',
  planningErrExcelServer: "Erreur lors de la génération du fichier Excel côté serveur. Réessayez ou contactez l'administrateur.",
  planningErrPdfServer: "Erreur lors de la génération du fichier PDF côté serveur. Réessayez ou contactez l'administrateur.",
  planningSuccessRun: 'Planning généré avec succès ✓',
  planningWarnInsufficientLots: 'Opération "{op}" : répartie sur {actual} machine(s) au lieu de {requested} — la commande n\'a pas assez de lots pour utiliser toutes les machines demandées ({available} disponible(s)).',
  planningWarnNotEnoughMachines: 'Opération "{op}" : seulement {available} machine(s) de ce type disponible(s) dans l\'atelier, {requested} demandée(s) — le planning a été généré sur {actual} machine(s).',
  planningErrNotEnoughMachines: 'Opération "{op}" : seulement {actual} machine(s) de ce type disponible(s) dans l\'atelier — réduisez le nombre de machines demandées ou ajoutez des machines.',
  // Commande management
  commandesTitle: 'Gestion des Commandes',
  commandesSubtitle: 'commande enregistrée',
  commandesSubtitle_plural: 'commandes enregistrées',
  addCommande: 'Nouvelle Commande',
  importCsv: 'Importer CSV',
  statPending: 'En attente',
  statInProgress: 'En cours',
  statUrgence1: 'Urgence = 1',
  searchCommandes: 'Rechercher par N° commande...',
  filterUrgencePlaceholder: 'Urgence…',
  filterAllStatuts: 'Tous les statuts',
  filterAllRecettes: 'Toutes les recettes',
  colNumeroCommande: 'N° Commande',
  colDateExport: 'Date Export',
  colUrgence: 'Urgence',
  colQuantite: 'Quantité',
  colRecette: 'Recette',
  noCommandesTitle: 'Aucune commande enregistrée',
  noCommandesDesc: 'Créez votre première commande ou importez un fichier CSV.',
  noCommandesSearchResult: 'Aucune commande ne correspond à vos filtres.',
  retryBtn: 'Réessayer',
  createCommandeTitle: 'Nouvelle Commande',
  createCommandeSubtitle: 'Renseignez les informations de la nouvelle commande',
  editCommandeTitle: 'Modifier la Commande',
  editCommandeSubtitle: 'Modifiez les informations de la commande',
  fieldNumeroCommande: 'N° Commande',
  fieldNumeroCommandePlaceholder: 'ex: 179213-ASA',
  fieldDateExport: "Date d'export",
  fieldUrgence: 'Urgence',
  fieldUrgenceHint: '(entier ≥ 1, plus petit = plus prioritaire)',
  fieldQuantite: 'Quantité',
  fieldQuantitePlaceholder: 'ex: 500',
  fieldRecette: 'Recette',
  fieldRecettePlaceholder: 'Sélectionner une recette...',
  createCommandeBtn: 'Créer la commande',
  updateCommandeBtn: 'Mettre à jour',
  deleteCommandeTitle: 'Supprimer la commande ?',
  deleteCommandeDesc: 'Cette action est irréversible.',
  commandeCreated: 'Commande créée ✓',
  commandeUpdated: 'Commande mise à jour ✓',
  commandeDeleted: 'Commande supprimée ✓',
  commandeDeleteError: 'Erreur lors de la suppression.',
  importCommandesTitle: 'Importer des Commandes',
  importCommandesSubtitle: 'Importez un fichier CSV pour ajouter plusieurs commandes à la fois',
  csvHintColumns: 'Colonnes attendues :',
  dropZoneText: 'Glissez votre fichier CSV ici',
  dropZoneOr: '— ou —',
  browseFiles: 'Parcourir les fichiers',
  changeFile: 'Changer le fichier',
  importingBtn: 'Import en cours...',
  importBtn: 'Importer',
  importedCount: 'importée(s)',
  skippedCount: 'ignorée(s) (doublons)',
  recetteOps: 'opération(s)',
  recetteMins: 'min. total',
  closeBtn: 'Fermer',
  sectionOverview: "Vue d'ensemble",
  sectionGestion: 'Gestion',
  adminPlanificationNav: 'Planification',
  adminPlanningTitle: 'Planification — Administration',
  adminPlanningSubtitle: 'Consultation des plannings de production',
  adminPlanningEmpty: 'Aucun planning disponible',
  adminPlanningEmptyHint: 'Les plannings générés par le responsable apparaîtront ici.',
  adminGanttTitle: 'Gantt — Planning',
  adminKpiPlannings: 'Plannings générés',
  adminKpiCommandes: 'Commandes planifiées',
  adminKpiOptimal: 'Plannings optimaux',
  adminFilterTitle: "Filtrer l'historique",
  adminFilterDateFrom: 'Date de génération — du',
  adminFilterDateTo: 'au',
  adminFilterMakespan: 'Makespan (jours)',
  adminFilterCommande: 'Commande :',
  adminFilterReset: 'Réinitialiser',
  adminFilteredLabel: 'filtrés',
  workerPlanningTitle: 'Planification Employé',
  workerPlanningSubtitle: 'Visualisation du planning de production en cours',
  workerPlanningEmpty: 'Aucun planning disponible',
  workerPlanningEmptyHint: "Un responsable doit d'abord générer un planning.",
  workerPlanningLoading: 'Chargement du planning…',
  workerGanttTitle: 'Diagramme de Gantt',
  workerKpiPlannings: 'Plannings disponibles',
   // Dashboard — KPI pills & labels
  kpiAttente: 'attente',
  kpiTerminees: 'terminées',
  kpiEnRetard: 'en retard',
  kpiAucunRetard: 'Aucun retard',
  kpiAchevement: 'achèvement',
  kpiOperationnelles: 'opérationnelles',
  kpiOperations: 'opérations',
  kpiOpsParRecette: 'ops/recette',
  kpiAdmin: 'admin',
  kpiPlanif: 'resp. planif.',
  kpiOperat: 'employé(s)',
  kpiTotal: 'total',
  kpiUtilisateurs: 'utilisateurs',
  kpiPrioriteMax: 'priorité max',
  kpiLabelCommandes: 'Commandes',
  kpiLabelUrgences: 'Urgences priorité 1',
  kpiLabelMachines: 'Machines fonctionnelles',
  kpiLabelPlannings: 'Plannings générés',
  kpiLabelRecettes: 'Recettes définies',
  kpiLabelUsers: 'Utilisateurs actifs',
  // Dashboard — chart titles & filters
  chartCommandesStatut: 'Commandes par statut',
  chartRepartitionUsers: 'Répartition des utilisateurs',
  chartEvolutionPlannings: 'Évolution des plannings — Makespan & commandes',
  chartEtatMachines: 'État du parc machines',
  chartDistributionUrgences: 'Distribution des urgences',
  chartTopRecettes: 'Top recettes utilisées dans les commandes',
  filter5Last: '5 derniers',
  filter10Last: '10 derniers',
  filterAll: 'Tous',
  filterFonctionnel: 'Fonctionnel',
  filterNonFonctionnel: 'Non fonctionnel',
  filterTop5: 'Top 5',
  filterTop10: 'Top 10',
  opsIndexTitle: 'Détail des opérations par recette',
  dashboardLoadError: 'Erreur lors du chargement des données du tableau de bord.',
  // Chart axes, labels & tooltips
  chartRoleAdmins: 'Administrateurs',
  chartRolePlanners: 'Responsables de planification',
  chartRoleOperators: 'Employés',
  chartRoleOthers: 'Autres',
  chartAxisMachines: 'Machines',
  chartAxisNombreMachines: 'Nombre de machines',
  chartAxisNombreCommandes: 'Nombre de commandes',
  chartAxisUrgence: "Niveau d'urgence",
  chartAxisRecette: 'Recette',
  chartPctDuParc: 'du parc',
  chartPctDuTotal: 'du total',
  chartUrgenceLabel: 'Urgence',
  chartTooltipCommandes: 'commande(s)',
  chartRecettePrefix: 'Recette',
  chartRecetteInconnue: 'Inconnue',
  // Statut values
  statutEnAttente: 'En attente',
  statutEnCours: 'En cours',
  statutTermine: 'Terminé',
  statutAnnule: 'Annulé',
  statutInconnu: 'Inconnu',
  // Dashboard
  dashboardTitle: 'Tableau de bord',
  dashboardSubtitle: "Vue d'ensemble de la production — Administrateur",
  dashboardRefresh: 'Actualiser',
  dashboardWelcomeHint: "Voici un aperçu en temps réel de votre système de production.",
  dashboardGreetingMorning: 'Bonjour',
  dashboardGreetingAfternoon: 'Bon après-midi',
  dashboardGreetingEvening: 'Bonsoir',
  dashboardMakespanAvg: 'makespan moy.',
  dashboardMakespanDays: 'Makespan (jours)',
  dashboardCommandesPlanifiees: 'Commandes planifiées',
  dashboardAxisPlanning: 'Planning',
  dashboardAxisMakespan: 'Makespan (j)',
  dashboardAxisCommandes: 'Commandes',
  dashboardAxisMakespanH: 'Makespan (h)',
  dashboardAxisMakespanMin: 'Makespan (min)',
  dashboardMakespanHours: 'Makespan (heures)',
  dashboardMakespanMin: 'Makespan (min)',
  // Chatbot
  chatbotTitle:            'Assistant Denim',
  chatbotSubtitle:         'Mistral · Ollama',
  chatbotEmptyHint:        'Posez une question sur votre planning, commandes ou machines.',
  chatbotSugg1:            'Commandes urgentes ?',
  chatbotSugg2:            'Optimiser le planning',
  chatbotSugg3:            'Opérations de lavage denim',
  chatbotInputPlaceholder: 'Votre question…',
  chatbotToggleTitle:      'Assistant IA',
  chatbotClearTitle:       'Effacer la conversation',
  // Locale
  appLocale: 'fr-FR',
  // Planner dashboard — banner & header
  plannerDashBannerRole: 'Centre de contrôle de production',
  plannerDashTitle: 'Tableau de bord de planification',
  plannerDashSubtitle: 'Suivi en temps réel de vos plannings et ressources',
  plannerDefaultName: 'Planificateur',
  // Planner dashboard — KPI labels
  plannerKpiPlanifEfficacite: 'Efficacité de planification',
  plannerKpiPlanningsCount: 'plannings',
  plannerKpiOptimal: '↑ Optimal',
  plannerKpiNormal: '→ Normal',
  plannerKpiMakespanMoyen: 'Makespan moyen',
  plannerKpiDureeMoyenne: 'Durée moyenne',
  plannerKpiChargeMachine: 'Charge machine moyenne',
  plannerKpiEnAttente: 'En attente de planification',
  plannerKpiAvancee: 'avancée',
  plannerKpiUrgences: 'Urgences prioritaires',
  plannerKpiActionRequise: 'Action requise',
  plannerKpiAucuneUrgence: 'Aucune urgence',
  plannerKpiQualitePlannings: 'Qualité des plannings',
  plannerKpiValides: 'validés',
  plannerKpiEnRegle: 'En règle',
  // Planner dashboard — chart titles & badges
  plannerChartEvolution: 'Évolution des plannings',
  plannerChartTotalBadge: 'total',
  plannerChartChargeMachine: 'Charge par machine',
  plannerChartMachinesBadge: 'machines',
  plannerChartMakespan: 'Distribution du makespan',
  plannerChartMakespanBadge: 'min moyen',
  plannerChartTopRecettes: 'Recettes les plus utilisées',
  // Planner dashboard — chart internals
  plannerChartMakespanDataset: 'Makespan',
  plannerChartAxisDuree: 'Durée',
  plannerChartCharge: 'chargé',
  plannerMakespanRange1: '< 1 jour',
  plannerMakespanRange2: '1 – 3 jours',
  plannerMakespanRange3: '3 – 7 jours',
  plannerMakespanRange4: '7 – 14 jours',
  plannerMakespanRange5: '> 14 jours',
  plannerMakespanDataset: 'Nombre de plannings',
  plannerMakespanAxisX: 'Nombre de plannings',
  plannerMakespanPctDuTotal: 'du total',
  plannerRecetteDataset: 'Commandes',
  plannerRecetteCommandeSuffix: 'commande(s)',
  // Planner dashboard — ops detail panel
  plannerOpsSelectPlaceholder: 'Sélectionner une recette...',
  plannerOpsOperationSuffix: 'opération',
  plannerOpsTotal: 'Total',
  plannerOpsPctDureeMax: 'de la durée max',
  plannerOpsEmptyHint: 'Sélectionnez une recette pour visualiser le détail de ses opérations',
  // Worker dashboard — KPI labels
  workerDashAvailablePlannings: 'Plannings disponibles',
  workerDashLastPlanning: 'Dernier : ',
  workerDashNoPlannings: 'Aucun planning',
  workerDashAssignedTasks: 'Tâches assignées',
  workerDashOrders: 'commandes',
  workerDashProductionDuration: 'Durée de production',
  workerDashFullDays: 'Journées complètes',
  workerDashLessThanADay: "Moins d'un jour",
  workerDashPlanningStatus: 'Statut planification',
  workerDashActivePlanning: 'Planning actif',
  // Worker dashboard — error & empty states
  workerDashLoadError: 'Impossible de charger les données',
  workerDashLoadErrorHint: 'Vérifiez que le serveur est accessible',
  workerDashRetry: 'Réessayer',
  workerDashNoPlanningAvailable: 'Aucun planning disponible',
  workerDashNoPlanningHint: 'Les plannings générés par le responsable apparaîtront ici.',
  workerDashTableEmpty: 'Aucun planning disponible.',
  // Worker dashboard — chart card titles & badges
  workerDashChartMachineLoad: 'Charge par machine — dernier planning',
  workerDashBadgeOps: 'Opérations',
  workerDashChartMakespan: 'Évolution du makespan',
  workerDashBadgeDays: 'Jours',
  workerDashChartOrders: 'Commandes par planning',
  workerDashBadgeQty: 'Quantité',
  workerDashChartHistory: 'Historique complet des plannings',
  // Worker dashboard — history filter options
  workerDashFilterAll: 'Tous les plannings',
  workerDashFilter10: 'Les 10 derniers',
  workerDashFilter20: 'Les 20 derniers',
  // Worker dashboard — table headers
  workerDashColId: '#',
  workerDashColDate: 'Date génération',
  workerDashColOrders: 'Commandes',
  workerDashColLines: 'Lignes',
  workerDashColStatus: 'Statut',
  // Worker dashboard — chart internals
  workerDashAxisOps: "Nombre d'opérations",
  workerDashDatasetMakespan: 'Makespan (jours)',
  workerDashAxisPlanningNum: 'Numéro de planning',
  workerDashAxisMakespanDays: 'Makespan (jours)',
  workerDashDatasetOrders: 'Commandes',
  workerDashAxisOrderCount: 'Nombre de commandes',
  // Worker dashboard — shift labels
  workerDashShiftBefore: 'Avant le service',
  workerDashShiftMorning: 'Matin — en service',
  workerDashShiftLunch: 'Pause déjeuner',
  workerDashShiftAfternoon: 'Après-midi — en service',
  workerDashShiftEnd: 'Fin de service',
  // Worker dashboard — clock sub-label
  workerDashClockDayPct: '% journée',
  // Planner dashboard — extra KPI labels
  plannerKpiEnAttenteLabel: 'en attente de planification',
  plannerKpiTotalPlannings: 'Total plannings',
  plannerKpiMoyenne: 'moyenne',
  plannerKpiActifs: 'actifs',
  // Planner dashboard — delay alerts panel
  alertsTitle: 'Alertes délais',
  alertsBadgeSuffix: 'alerte(s)',
  alertsCriticalBadge: 'critique(s)',
  alertsFilterAll: 'Toutes',
  alertsFilterCritical: 'Critique',
  alertsFilterWarning: 'Avertissement',
  alertsFilterInfo: 'Info',
  alertsDismissAll: 'Tout ignorer',
  alertsSeverityCritical: 'Critique',
  alertsSeverityWarning: 'Avertissement',
  alertsSeverityInfo: 'Info',
  alertsExportLabel: 'Export',
  alertsOverdueBy: 'En retard de',
  alertsDaysLeft: 'Jours restants',
  alertsUrgent: 'URGENT',
  alertsDismissOne: 'Ignorer cette alerte',
  alertsAllClear: 'Aucune alerte active.',
  alertsMsgOverdue: 'En retard de {days} jour(s)',
  alertsMsgDueToday: "À livrer aujourd'hui",
  alertsMsgWarning: 'Dans {days} jour(s)',
  alertsMsgInfo: 'Dans {days} jour(s)',
  // Planner dashboard — bottleneck notification panel
  notifPanelTitle: 'Alertes de charge',
  notifFilterAll: 'Tout',
  notifFilterOverloaded: 'Surchargées',
  notifFilterUnderused: 'Sous-utilisées',
  notifFilterInactive: 'Inactives',
  notifTagOverloaded: 'Surchargée',
  notifTagUnderused: 'Sous-utilisée',
  notifTagInactive: 'Inactive',
  notifDismissTitle: "Rejeter l'alerte pour",
  notifEmpty: 'Aucune alerte de charge active',
  notifFooterOverloaded: 'surchargée(s)',
  notifFooterUnderused: 'sous-utilisée(s)',
  notifFooterInactive: 'inactive(s)',
  notifFooterBalanced: 'Charge équilibrée',
  notifDismissAll: 'Tout rejeter',
  notifClose: 'Fermer',
  notifMsgOverloaded: 'Surchargée à {pct}% (seuil : {threshold}%). Risque de surcharge.',
  notifMsgUnderused:  'Sous-utilisée à {pct}% (seuil : {threshold}%). Capacité non exploitée.',
  notifMsgInactive:   'Machine inactive — aucune tâche planifiée.',
  // Admin users — additional keys
  clearSearch: 'Effacer la recherche',
  passwordMismatch: 'Les mots de passe ne correspondent pas',
  saving: 'Enregistrement…',
  deleteUserTitle: 'Supprimer utilisateur',
  deleteUserConfirm: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
  cancelBtn: 'Annuler',
  deleting: 'Suppression…',
  // Planner dashboard — deadline-compliance report section
  complianceSectionTitle: "Respect des dates d'export",
  complianceSectionSubtitle: 'Taux de livraison dans les délais prévus',
  complianceDateFrom: 'Du',
  complianceDateTo: 'Au',
  complianceRunBtn: 'Générer',
  complianceRunningBtn: 'Calcul…',
  complianceKpiRate: 'Taux de respect',
  complianceKpiOnTime: 'Dans les délais',
  complianceKpiLate: 'En retard',
  complianceKpiPending: 'En cours',
  complianceKpiVariance: 'Écart moyen',
  complianceVarianceAhead: 'Avance moyenne',
  complianceVarianceBehind: 'Retard moyen',
  complianceChartTitle: 'Répartition des commandes',
  complianceChartBadge: 'total',
  complianceTableTitle: 'Détail par commande',
  complianceFilterAll: 'Toutes',
  complianceFilterOnTime: 'À temps',
  complianceFilterLate: 'Retard',
  complianceFilterPending: 'En cours',
  complianceColCommande: 'Commande',
  complianceColRecette: 'Recette',
  complianceColDateExport: "Date d'export",
  complianceColVariance: 'Écart',
  complianceColStatut: 'Statut',
  complianceRowEmpty: 'Aucune commande pour ce filtre.',
  complianceEmptyHint: 'Cliquez sur <strong>Générer</strong> pour afficher le rapport de respect des délais.',
  complianceLoadError: 'Erreur lors du chargement du rapport.',
  complianceBadgeOnTime: 'À temps',
  complianceBadgeLate: 'Retard',
  complianceBadgePending: 'En cours',
  complianceChartLabelOnTime: 'Dans les délais',
  complianceChartLabelLate: 'En retard',
  complianceChartLabelPending: 'En cours',
  complianceTooltipSuffix: 'commande(s)',
  alertErrNetwork:             'Impossible de joindre le serveur. Vérifiez que le backend .NET est démarré.',
  alertErrUnauthorized:        'Session expirée (401). Reconnectez-vous et réessayez.',
  alertErrForbidden:           'Accès refusé (403). Votre rôle ne permet pas cette action sur les alertes.',
  alertErrNotFound:            'Alerte introuvable (404). Elle a peut-être déjà été supprimée.',
  alertErrServer:              'Erreur serveur lors du traitement des alertes. Réessayez ou contactez l\'administrateur.',
  alertErrRefreshFailed:       'Impossible de recalculer les alertes. Vérifiez la connexion au serveur.',
  alertErrDismissFailed:       'Impossible d\'ignorer cette alerte. Réessayez dans un instant.',
  alertErrDismissAllDelay:     'Impossible d\'ignorer toutes les alertes délais. Réessayez dans un instant.',
  alertErrDismissAllBottleneck:'Impossible d\'ignorer toutes les alertes de charge. Réessayez dans un instant.',
  alertErrLoadFailed:          'Impossible de charger les alertes. Vérifiez que le serveur est accessible.',

};

const EN: Translations = {
  appName: 'DenimPlanner',
  tagline: 'Intelligent Planning',
  getStarted: 'Get Started',
  learnMore: 'Learn More',
  login: 'Login',
  signup: 'Sign Up',
  logout: 'Logout',
  myProfile: 'My profile',
  darkMode: 'Dark mode',
  lightMode: 'Light mode',
  expandSidebar: 'Expand',
  collapseSidebar: 'Collapse',
  adminRoleLabel: 'Administrator',
  plannerRoleLabel: 'Planning Manager',
  workerRoleLabel: 'Worker',
  usersNav: 'Users',
  machinesNav: 'Machines',
  commandesNav: 'Orders',
  recettesNav: 'Recipes',
  dashboardNav: 'Dashboard',
  emailInvalid: 'Invalid email address',
  passwordMin6: 'Minimum 6 characters',
  passwordMin8: 'Minimum 8 characters',
  pwdReqLength: 'At least 8 characters',
  pwdReqUpper: 'One uppercase letter',
  pwdReqDigit: 'One number (0–9)',
  pwdReqSpecial: 'One special character (!@#$…)',
  pwdWeak: 'Weak',
  pwdMedium: 'Medium',
  pwdStrong: 'Strong',
  signingIn: 'Signing in...',
  heroTitle: 'Optimized Production Planning',
  heroSubtitle: 'for the Denim Industry',
  heroDescription: 'Intelligent system powered by Google OR-Tools for multi-constraint management of denim production orders. Optimize your manufacturing lines with precision.',
  featuresTitle: 'Key Features',
  featuresSubtitle: 'A complete solution for industrial planning',
  feature1Title: 'OR-Tools Optimization',
  feature1Desc: 'Advanced scheduling algorithms using Google OR-Tools to solve complex scheduling problems in real time.',
  feature2Title: 'Multi-Constraint Management',
  feature2Desc: 'Simultaneous management of capacity, deadlines, human resources, and material constraints for realistic planning.',
  feature3Title: 'Analytics Dashboard',
  feature3Desc: 'Real-time visualizations of machine load, order progress, and key performance indicators.',
  ctaTitle: 'Ready to optimize your production?',
  ctaSubtitle: 'Join the industrialists who have transformed their production chain',
  statsTitle: 'Proven Results',
  stat1Label: 'Lead time reduction',
  stat2Label: 'Increased efficiency',
  stat3Label: 'Orders planned',
  stat4Label: 'Satisfied clients',
  welcomeBack: 'Welcome Back',
  signInDesc: 'Sign in to your planning workspace',
  emailLabel: 'Email address',
  emailPlaceholder: 'your@email.com',
  passwordLabel: 'Password',
  passwordPlaceholder: '••••••••',
  rememberMe: 'Remember me',
  forgotPassword: 'Forgot password?',
  signIn: 'Sign In',
  noAccount: "Don't have an account?",
  createAccount: 'Create account',
  alreadyAccount: 'Already have an account?',
  firstNameLabel: 'First name',
  lastNameLabel: 'Last name',
  confirmPassword: 'Confirm password',
  confirmPasswordPlaceholder: '••••••••',
  roleLabel: 'Role',
  roleAdmin: 'Administrator',
  rolePlanner: 'Planner',
  roleOperator: 'Operator',
  signupTitle: 'Create Account',
  signupDesc: 'Join the planning platform',
  forgotTitle: 'Password Recovery',
  forgotDesc: 'Enter your email to receive a reset link',
  sendReset: 'Send Reset Link',
  backToLogin: 'Back to Login',
  resetSent: 'Email Sent',
  resetSentDesc: 'Check your inbox for the password reset link.',
  footerRights: 'All rights reserved',
  footerPrivacy: 'Privacy Policy',
  footerTerms: 'Terms of Service',
  footerContact: 'Contact',
  companyBadge: 'Since 1990 • Ras Jebal, Bizerte',
  heroTitleLine1: 'WIC MIC GROUP',
  heroTitleLine2: 'We produce jeans in a sustainable way',
  heroDescLanding: "Since 2013, we shifted our mindset to be part of the new generation of producers combining industry and conscience. Zero water discharge, Laser & Ozone, controlled carbon footprint — fashion and sustainability united in every piece.",
  employeesLabel: 'Dedicated Employees',
  establishedLabel: 'Years of Excellence',
  experienceLabel: 'Years Experience',
  denimFlow: 'Denim Production Flow',
  designLabel: 'Design',
  preparationLabel: 'Preparation',
  manufacturingLabel: 'Manufacturing',
  finishingLabel: 'Finishing',
  sustainableProduction: 'Sustainable Production',
  efficiencyLabel: 'Efficiency',
  jeansProduced: 'Jeans Produced',
  productionDelay: 'Production Delay',
  heritageTitle: 'OUR HERITAGE',
  heritageSubtitle: 'Three Decades of Textile Excellence',
  heritageDesc: "Since 1990, WIC MIC GROUP has been at the forefront of Tunisia's textile industry, specializing in premium denim jeans production. From our base in Beni Atta, Bizerte, we've grown to become one of the largest textile groups in Tunisia, integrating sustainable practices with innovative manufacturing.",
  sustainableManufacturing: 'Sustainable Manufacturing',
  sustainableManufacturingDesc: 'Significant investments in environmental initiatives and responsible production.',
  globalExport: 'Global Export',
  globalExportDesc: 'Design, preparation, finishing, and export of textiles and accessories worldwide.',
  companyFounded: 'Company Founded',
  majorExpansion: 'Major Expansion',
  sustainabilityInitiative: 'Sustainability Initiative',
  digitalTransformation: 'Digital Transformation',
  digitalTransformationTitle: 'DIGITAL TRANSFORMATION',
  digitalTransformationSubtitle: 'Revolutionizing Denim Production with AI',
  smartSchedulingTitle: 'Smart Production Scheduling',
  smartSchedulingDesc: 'AI-powered optimization of our denim production lines using Google OR-Tools for maximum efficiency.',
  resourceOptimizationTitle: 'Resource Optimization',
  resourceOptimizationDesc: "Intelligent allocation of our 1,900+ workforce and machinery across design, preparation, and finishing departments.",
  realtimeMonitoringTitle: 'Real-time Monitoring',
  realtimeMonitoringDesc: 'Live tracking of production metrics and efficiency across all manufacturing stages.',
  sustainableAnalyticsTitle: 'Sustainable Analytics',
  sustainableAnalyticsDesc: 'Track environmental impact and sustainability metrics aligned with our ecological commitments.',
  joinWicMic: 'Join the WIC MIC GROUP Revolution',
  joinWicMicDesc: 'Discover how our DenimPlanner platform can transform your production',
  footerAddress: 'Beni Atta, Ras Jebal, Bizerte, Tunisia',
  authLayoutTitle: 'Optimized Planning System for Denim',
  authLayoutDesc: 'Powered by Google OR-Tools for precise and efficient multi-constraint management of your production orders.',
  authFeature1: 'Optimized multi-machine scheduling',
  authFeature2: 'Deadline and constraint management',
  authFeature3: 'Real-time dashboard',
  resetTitle: 'New password',
  resetDesc: 'Choose a strong password to secure your account.',
  newPasswordLabel: 'New password',
  newPasswordPlaceholder: 'Minimum 8 characters',
  resetPassword: 'Reset password',
  resetSuccessTitle: 'Password changed!',
  resetSuccessDesc: 'Your password has been reset successfully. You can now sign in.',
  resetInvalidTitle: 'Invalid or expired link',
  resetInvalidDesc: 'This reset link is invalid or has expired. Please request a new one.',
  requestNewLink: 'Request a new link',
  orContinueWith: 'or continue with',
  orWithEmail: 'or sign up with email',
  loginWithGoogle: 'Sign in with Google',
  registerWithGoogle: 'Sign up with Google',
  roleHint: '(applies to Google signup too)',
  googleCompleteTitle: 'Complete your registration',
  googleCompleteDesc: 'Choose your role and set a password so you can also sign in with email.',
  choosePasswordLabel: 'Create a password',
  googlePasswordHint: '(to also sign in with email)',
  backToSignup: 'Back to sign up',
  adminUsersTitle: 'User Management',
  usersTotal: 'users',
  addUser: 'Add user',
  searchUsers: 'Search...',
  nameCol: 'Name',
  emailCol: 'Email',
  roleCol: 'Role',
  statusCol: 'Status',
  actionsCol: 'Actions',
  activeStatus: 'Active',
  inactiveStatus: 'Inactive',
  statusLabel: 'Status',
  createUserTitle: 'Create user',
  editUserTitle: 'Edit user',
  leaveBlankPassword: '(leave blank to keep unchanged)',
  deleteConfirmTitle: 'Delete user?',
  deleteConfirmDesc: 'This action cannot be undone.',
  cancel: 'Cancel',
  createBtn: 'Create',
  saveBtn: 'Save',
  deleteBtn: 'Delete',
  role_Admin: 'Administrator',
  role_PlanificationResponsable: 'Planning Manager',
  role_Worker: 'Worker',
  machinesTitle: 'Machine Management',
  machinesTotal: 'machine configured',
  machinesTotal_plural: 'machines configured',
  addMachine: 'New Machine',
  searchMachines: 'Search by code or name...',
  allTypes: 'All types',
  allStatuts: 'All statuses',
  statTotal: 'Total',
  statAvailable: 'Available',
  statMaintenance: 'Maintenance',
  statOutOfService: 'Out of service',
  noMachinesTitle: 'No machines configured',
  noMachinesDesc: 'Add your first machine to get started.',
  colMachine: 'Machine',
  colType: 'Type',
  colCapacity: 'Capacity',
  colSetup: 'Setup',
  colOperations: 'Operations',
  colStatut: 'Status',
  colActions: 'Actions',
  noSearchResult: 'No machine matches your search.',
  editMachineTitle: 'Edit Machine',
  editMachineDesc: 'Update the machine information',
  newMachineTitle: 'New Machine',
  newMachineDesc: 'Fill in the details for the new machine',
  fieldCodeMachine: 'Machine Code',
  fieldNomMachine: 'Machine Name',
  fieldType: 'Type',
  fieldStatut: 'Status',
  fieldCapacity: 'Capacity',
  fieldSetup: 'Setup Time',
  fieldOperations: 'Possible Operations',
  fieldOperationsHint: '— used by the optimizer',
  fieldJourMaintenance: 'Maintenance Day',
  fieldFrequenceMaintenance: 'Maintenance Frequency',
  selectPlaceholder: 'Select...',
  updateBtn: 'Update',
  createMachineBtn: 'Create machine',
  deleteMachineTitle: 'Delete machine?',
  deleteMachineDesc: 'This action is irreversible. The optimization module will no longer be able to use this machine.',
  machineCreated: 'Machine created ✓',
  machineUpdated: 'Machine updated ✓',
  machineDeleted: 'Machine deleted ✓',
  machineCreateError: 'Error creating machine',
  machineUpdateError: 'Error updating machine',
  machineDeleteError: 'Error deleting machine',
  profileInfoTab: 'Personal info',
  profilePasswordTab: 'Password',
  profileInfoDesc: 'Update your profile information.',
  profilePasswordDesc: 'Change your login password.',
  currentPasswordLabel: 'Current password',
  changePasswordBtn: 'Change password',
  photoLabel: 'Profile photo',
  dragDropPhoto: 'Drag a photo here, or',
  browsePhoto: 'browse',
  removePhoto: 'Remove photo',
  completeProfileTitle: 'Choose your role',
  completeProfileDesc: 'Welcome, ',
  confirmRole: 'Confirm and get started',
  savingProfile: 'Saving...',
  roleAdminDesc: 'Full access — manage users, roles and system configuration.',
  rolePlannerDesc: 'Plan and schedule denim production orders.',
  roleOperatorDesc: 'Track and execute tasks on the manufacturing lines.',
  recettesTitle: 'Recipe Management',
  recettesSubtitle: 'recipe configured',
  recettesSubtitle_plural: 'recipes configured',
  addRecette: 'New Recipe',
  searchRecettes: 'Search by recipe name...',
  statTotalRecettes: 'Total recipes',
  statTotalOps: 'Total operations',
  statAvgDuration: 'Avg. recipe duration',
  statAvgDurationUnit: 'min',
  noRecettesTitle: 'No recipes configured',
  noRecettesDesc: 'Create your first recipe to associate it with orders.',
  noSearchResultRecette: 'No recipe matches your search.',
  newRecetteTitle: 'New Recipe',
  newRecetteSubtitle: 'Define the manufacturing operation sequence',
  editRecetteTitle: 'Edit Recipe',
  editRecetteSubtitle: 'Modify the operation sequence',
  fieldNomRecette: 'Recipe name',
  fieldNomRecettePlaceholder: 'e.g. 33115',
  fieldDescription: 'Description',
  fieldDescriptionPlaceholder: 'e.g. Water treatment',
  fieldDescriptionHint: '(optional)',
  opsSequenceLabel: 'Operation sequence',
  addOpBtn: 'Add operation',
  fieldMachine: 'Machine',
  fieldOperation: 'Operation',
  fieldDureeMin: 'Duration (min)',
  fieldQteLot: 'Batch qty',
  chooseOpFirst: 'Choose machine first',
  opsEmptyHint: 'No operations. Click "Add operation".',
  deleteRecetteTitle: 'Delete recipe?',
  deleteRecetteDesc: 'Cannot delete if orders are using this recipe.',
  recetteCreated: 'Recipe created ✓',
  recetteUpdated: 'Recipe updated ✓',
  recetteDeleted: 'Recipe deleted ✓',
  createRecetteBtn: 'Create recipe',
  updateRecetteBtn: 'Update',
  badgeOps: 'operation(s)',
  badgeDuration: 'min total',
  // Recette — operation confirm/remove dialog
  fieldChargementMin: 'Load (min)',
  fieldDecharementMin: 'Unload (min)',
  removeOpTitle: 'Remove operation',
  confirmRemoveOpLabel: 'Are you sure you want to remove this operation?',
  confirmRemoveOpYes: 'Remove',
  confirmRemoveOpNo: 'Cancel',
  serverError: 'Unable to reach the server.',
  noUserFound: 'No user found for',
  incorrectPassword: 'Incorrect password',
  passwordChangedSuccess: 'Password changed successfully.',
  genericError: 'An error occurred.',
  // ── Planning page — general ───────────────────────────────────────────────
  planningTitle: 'Production Planning',
  planningSubtitle: 'CP-SAT Multi-Constraint Scheduling',
  planningHistoryPlaceholder: 'Planning history…',
  planningRunBtn: 'Run optimization',
  planningRunning: 'Optimizing…',
  planningExporting: 'Exporting…',
  planningOptimizing: 'CP-SAT optimization in progress…',
  planningOptimizingDesc: 'LNS → CP-SAT. This may take up to 120 seconds.',
  planningEmptyTitle: 'No planning generated',
  planningEmptyHint: 'Click "Run optimization" to start the CP-SAT solver.',
  planningKpiMakespan: 'Makespan',
  planningKpiMakespanUnit: 'd',
  planningKpiCommandes: 'Orders',
  planningKpiLignes: 'Gantt rows',
  planningKpiMachines: 'Active machines',
  planningKpiOnTime: 'On time',
  planningKpiDebut: 'Plan start',
  planningFilterUrgence: 'Urgency:',
  planningFilterAll: 'All',
  planningFilterMachine: 'Machine:',
  planningFilterMachinePlaceholder: 'Filter machine…',
  planningFilterAllMachines: 'All machines',
  planningFilterCommande: 'Order:',
  planningFilterCommandePlaceholder: 'Filter order…',
  planningFilterAllCommandes: 'All orders',
  planningFilterZoom: 'Zoom:',
  planningCornerDay: 'Day',
  planningCornerHour: 'Hour',
  planningOpLabel: 'ops.',
  planningTableTitle: 'Scheduled operations',
  planningTableLines: 'rows',
  planningTableEmpty: 'No rows for these filters.',
  planningColMachine: 'Machine',
  planningColCommande: 'Order',
  planningColOperation: 'Operation',
  planningColStart: 'Start',
  planningColEnd: 'End',
  planningColLoad: 'Load',
  planningColCycle: 'Cycle',
  planningColUnload: 'Unload',
  planningColLot: 'Lot',
  planningColPieces: 'Pieces',
  planningColUrgence: 'Urgency',
  planningColExport: 'Export',
  planningDetailMachine: 'Machine',
  planningDetailStart: 'Start',
  planningDetailEnd: 'End',
  planningDetailLoad: 'Load time',
  planningDetailCycle: 'Cycle',
  planningDetailUnload: 'Unload time',
  planningDetailLot: 'Lot',
  planningDetailPieces: 'Pieces',
  planningDetailUrgence: 'Urgency',
  planningDetailExportDate: 'Export date',
  planningDetailQty: 'Total quantity',
  // ── Planning page — run-options modal ────────────────────────────────────
  planningModalSubtitle: 'Configure optimization parameters',
  planningModalMachineLabel: 'Machines per operation',
  planningModalMachineHint: 'Choose how many machines can process lots of the same operation in parallel.',
  planningModalMachineSingular: 'machine',
  planningModalMachinePlural: 'machines',
  planningModalInfo1: 'Default behaviour: all lots of an operation are processed sequentially on a single machine.',
  planningModalInfoN1: 'Lots will be distributed evenly across ',
  planningModalInfoN2: ' available for each operation type. If an operation has only one machine in the workshop, a warning will be shown after optimization.',
  planningMachineDesc1: 'All lots on a single machine',
  planningMachineDesc2: 'Lots split across 2 machines',
  planningMachineDesc3: 'Lots split across 3 machines',
  // Planning page — modal start datetime
  planningModalStartLabel: 'Planning start',
  planningModalStartHint: 'Choose the date and time at which production should start. Default: now.',
  planningModalNow: 'Now',
  planningModalStartPreview: 'Scheduled start:',
  // Planning page — late chip
  planningLateChip: 'Overdue',
  planningLateNoticeTitle: 'Overdue orders',
  // ── Planning page — makespan formatted ───────────────────────────────────
  planningKpiMakespanDay: 'd',
  planningKpiMakespanHour: 'h',
  // ── Planning page — specific error messages ──────────────────────────────
  planningErrNoCommandes: 'No orders to schedule. Create or import orders before running the solver.',
  planningErrNoMachines: 'No machines available. Make sure machines are configured and set to active.',
  planningErrNoRecettes: 'Some orders have no recipe assigned. Assign a recipe to every order before optimizing.',
  planningErrTimeout: 'The CP-SAT solver exceeded the maximum time limit (120 s). Reduce the number of orders or relax the constraints.',
  planningErrInfeasible: 'No feasible solution found. Constraints are too tight — check machine capacities and export dates.',
  planningErrServer: 'Internal server error (500). Contact your administrator if the problem persists.',
  planningErrUnauthorized: 'Session expired or not authenticated (401). Please sign in again and retry.',
  planningErrForbidden: 'Access denied (403). Your account does not have permission to run the optimization.',
  planningErrNotFound: 'Resource not found (404). Check that orders and recipes still exist.',
  planningErrUnprocessable: 'Invalid data (422). Check your recipes and machine capacities.',
  planningErrRateLimit: 'Too many requests (429). Wait a few seconds before retrying the optimization.',
  planningErrNetwork: 'Cannot reach the optimization server. Check your network connection.',
  planningErrExcelEmpty: 'Nothing to export. Generate a planning before downloading the Excel file.',
  planningErrPdfEmpty: 'The server is unreachable. Please try again later.',
  planningErrExcelServer: 'Server error while generating the Excel file. Retry or contact your administrator.',
  planningErrPdfServer: 'Server error while generating the PDF file. Retry or contact your administrator.',
  planningSuccessRun: 'Planning generated successfully ✓',
  planningWarnInsufficientLots: 'Operation "{op}": split across {actual} machine(s) instead of {requested} — the order doesn\'t have enough lots to use all requested machines ({available} available).',
  planningWarnNotEnoughMachines: 'Operation "{op}": only {available} machine(s) of this type exist in the workshop, {requested} requested — the plan was generated using {actual} machine(s).',
  planningErrNotEnoughMachines: 'Operation "{op}": only {actual} machine(s) of this type exist in the workshop — lower the requested machine count or add more machines.',
  // Commande management
  commandesTitle: 'Order Management',
  commandesSubtitle: 'order registered',
  commandesSubtitle_plural: 'orders registered',
  addCommande: 'New Order',
  importCsv: 'Import CSV',
  statPending: 'Pending',
  statInProgress: 'In Progress',
  statUrgence1: 'Urgency = 1',
  searchCommandes: 'Search by order number...',
  filterUrgencePlaceholder: 'Urgency…',
  filterAllStatuts: 'All statuses',
  filterAllRecettes: 'All recipes',
  colNumeroCommande: 'Order No.',
  colDateExport: 'Export Date',
  colUrgence: 'Urgency',
  colQuantite: 'Quantity',
  colRecette: 'Recipe',
  noCommandesTitle: 'No orders registered',
  noCommandesDesc: 'Create your first order or import a CSV file.',
  noCommandesSearchResult: 'No order matches your filters.',
  retryBtn: 'Retry',
  createCommandeTitle: 'New Order',
  createCommandeSubtitle: 'Fill in the details for the new order',
  editCommandeTitle: 'Edit Order',
  editCommandeSubtitle: 'Update the order information',
  fieldNumeroCommande: 'Order No.',
  fieldNumeroCommandePlaceholder: 'e.g. 179213-ASA',
  fieldDateExport: 'Export date',
  fieldUrgence: 'Urgency',
  fieldUrgenceHint: '(integer ≥ 1, lower = higher priority)',
  fieldQuantite: 'Quantity',
  fieldQuantitePlaceholder: 'e.g. 500',
  fieldRecette: 'Recipe',
  fieldRecettePlaceholder: 'Select a recipe...',

  createCommandeBtn: 'Create order',
  updateCommandeBtn: 'Update',
  deleteCommandeTitle: 'Delete order?',
  deleteCommandeDesc: 'This action cannot be undone.',
  commandeCreated: 'Order created ✓',
  commandeUpdated: 'Order updated ✓',
  commandeDeleted: 'Order deleted ✓',
  commandeDeleteError: 'Error deleting order.',
  importCommandesTitle: 'Import Orders',
  importCommandesSubtitle: 'Import a CSV file to add multiple orders at once',
  csvHintColumns: 'Expected columns:',
  dropZoneText: 'Drag your CSV file here',
  dropZoneOr: '— or —',
  browseFiles: 'Browse files',
  changeFile: 'Change file',
  importingBtn: 'Importing...',
  importBtn: 'Import',
  importedCount: 'imported',
  skippedCount: 'skipped (duplicates)',
  recetteOps: 'operation(s)',
  recetteMins: 'min total',
  closeBtn: 'Close',
  sectionOverview: 'Overview',
  sectionGestion: 'Management',
  adminPlanificationNav: 'Planning',
  adminPlanningTitle: 'Planning — Administration',
  adminPlanningSubtitle: 'Production planning overview',
  adminPlanningEmpty: 'No planning available',
  adminPlanningEmptyHint: 'Plannings generated by the planner will appear here.',
  adminGanttTitle: 'Gantt — Planning',
  adminKpiPlannings: 'Plannings generated',
  adminKpiCommandes: 'Orders planned',
  adminKpiOptimal: 'Optimal plannings',
  adminFilterTitle: 'Filter history',
  adminFilterDateFrom: 'Generation date — from',
  adminFilterDateTo: 'to',
  adminFilterMakespan: 'Makespan (days)',
  adminFilterCommande: 'Order:',
  adminFilterReset: 'Reset filters',
  adminFilteredLabel: 'filtered',
  workerPlanningTitle: 'Worker\'s Planning',
  workerPlanningSubtitle: 'Current production planning overview',
  workerPlanningEmpty: 'No planning available',
  workerPlanningEmptyHint: 'A planner must generate a planning first.',
  workerPlanningLoading: 'Loading planning…',
  workerGanttTitle: 'Gantt Chart',
  workerKpiPlannings: 'Available plannings',
  // Dashboard — KPI pills & labels
  kpiAttente: 'pending',
  kpiTerminees: 'completed',
  kpiEnRetard: 'overdue',
  kpiAucunRetard: 'No delays',
  kpiAchevement: 'completion',
  kpiOperationnelles: 'operational',
  kpiOperations: 'operations',
  kpiOpsParRecette: 'ops/recipe',
  kpiAdmin: 'admin',
  kpiPlanif: 'planning mgr',
  kpiOperat: 'employee(s)',
  kpiTotal: 'total',
  kpiUtilisateurs: 'users',
  kpiPrioriteMax: 'max priority',
  kpiLabelCommandes: 'Orders',
  kpiLabelUrgences: 'Urgency priority 1',
  kpiLabelMachines: 'Operational machines',
  kpiLabelPlannings: 'Plannings generated',
  kpiLabelRecettes: 'Recipes defined',
  kpiLabelUsers: 'Active users',
  // Dashboard — chart titles & filters
  chartCommandesStatut: 'Orders by status',
  chartRepartitionUsers: 'User breakdown',
  chartEvolutionPlannings: 'Planning history — Makespan & orders',
  chartEtatMachines: 'Machine fleet status',
  chartDistributionUrgences: 'Urgency distribution',
  chartTopRecettes: 'Top recipes used in orders',
  filter5Last: 'Last 5',
  filter10Last: 'Last 10',
  filterAll: 'All',
  filterFonctionnel: 'Operational',
  filterNonFonctionnel: 'Non-operational',
  filterTop5: 'Top 5',
  filterTop10: 'Top 10',
  opsIndexTitle: 'Operations detail per recipe',
  dashboardLoadError: 'Error loading dashboard data.',
  // Chart axes, labels & tooltips
  chartRoleAdmins: 'Administrators',
  chartRolePlanners: 'Planning Managers',
  chartRoleOperators: 'Employees',
  chartRoleOthers: 'Others',
  chartAxisMachines: 'Machines',
  chartAxisNombreMachines: 'Number of machines',
  chartAxisNombreCommandes: 'Number of orders',
  chartAxisUrgence: 'Urgency level',
  chartAxisRecette: 'Recipe',
  chartPctDuParc: 'of fleet',
  chartPctDuTotal: 'of total',
  chartUrgenceLabel: 'Urgency',
  chartTooltipCommandes: 'order(s)',
  chartRecettePrefix: 'Recipe',
  chartRecetteInconnue: 'Unknown',
  // Statut values
  statutEnAttente: 'Pending',
  statutEnCours: 'In progress',
  statutTermine: 'Completed',
  statutAnnule: 'Cancelled',
  statutInconnu: 'Unknown',
  // Dashboard
  dashboardTitle: 'Dashboard',
  dashboardSubtitle: 'Production overview — Administrator',
  dashboardRefresh: 'Refresh',
  dashboardWelcomeHint: 'Here is a real-time overview of your production system.',
  dashboardGreetingMorning: 'Good morning',
  dashboardGreetingAfternoon: 'Good afternoon',
  dashboardGreetingEvening: 'Good evening',
  dashboardMakespanAvg: 'avg. makespan',
  dashboardMakespanDays: 'Makespan (days)',
  dashboardCommandesPlanifiees: 'Scheduled orders',
  dashboardAxisPlanning: 'Planning',
  dashboardAxisMakespan: 'Makespan (d)',
  dashboardAxisCommandes: 'Orders',
  dashboardAxisMakespanH: 'Makespan (h)',
  dashboardAxisMakespanMin: 'Makespan (min)',
  dashboardMakespanHours: 'Makespan (hours)',
  dashboardMakespanMin: 'Makespan (min)',
  // Chatbot
  chatbotTitle:            'Denim Assistant',
  chatbotSubtitle:         'Mistral · Ollama',
  chatbotEmptyHint:        'Ask a question about your planning, orders or machines.',
  chatbotSugg1:            'Urgent orders?',
  chatbotSugg2:            'Optimize the schedule',
  chatbotSugg3:            'Denim washing operations',
  chatbotInputPlaceholder: 'Your question…',
  chatbotToggleTitle:      'AI Assistant',
  chatbotClearTitle:       'Clear conversation',
  // Locale
  appLocale: 'en-GB',
  // Planner dashboard — banner & header
  plannerDashBannerRole: 'Production Control Centre',
  plannerDashTitle: 'Planning Dashboard',
  plannerDashSubtitle: 'Real-time tracking of your schedules and resources',
  plannerDefaultName: 'Planner',
  // Planner dashboard — KPI labels
  plannerKpiPlanifEfficacite: 'Scheduling efficiency',
  plannerKpiPlanningsCount: 'schedules',
  plannerKpiOptimal: '↑ Optimal',
  plannerKpiNormal: '→ Normal',
  plannerKpiMakespanMoyen: 'Average makespan',
  plannerKpiDureeMoyenne: 'Average duration',
  plannerKpiChargeMachine: 'Average machine load',
  plannerKpiEnAttente: 'Awaiting scheduling',
  plannerKpiAvancee: 'progress',
  plannerKpiUrgences: 'Priority urgencies',
  plannerKpiActionRequise: 'Action required',
  plannerKpiAucuneUrgence: 'No urgencies',
  plannerKpiQualitePlannings: 'Schedule quality',
  plannerKpiValides: 'validated',
  plannerKpiEnRegle: 'In order',
  // Planner dashboard — chart titles & badges
  plannerChartEvolution: 'Schedule history',
  plannerChartTotalBadge: 'total',
  plannerChartChargeMachine: 'Machine load',
  plannerChartMachinesBadge: 'machines',
  plannerChartMakespan: 'Makespan distribution',
  plannerChartMakespanBadge: 'min avg',
  plannerChartTopRecettes: 'Most used recipes',
  // Planner dashboard — chart internals
  plannerChartMakespanDataset: 'Makespan',
  plannerChartAxisDuree: 'Duration',
  plannerChartCharge: 'loaded',
  plannerMakespanRange1: '< 1 day',
  plannerMakespanRange2: '1 – 3 days',
  plannerMakespanRange3: '3 – 7 days',
  plannerMakespanRange4: '7 – 14 days',
  plannerMakespanRange5: '> 14 days',
  plannerMakespanDataset: 'Number of schedules',
  plannerMakespanAxisX: 'Number of schedules',
  plannerMakespanPctDuTotal: 'of total',
  plannerRecetteDataset: 'Orders',
  plannerRecetteCommandeSuffix: 'order(s)',
  // Planner dashboard — ops detail panel
  plannerOpsSelectPlaceholder: 'Select a recipe...',
  plannerOpsOperationSuffix: 'operation',
  plannerOpsTotal: 'Total',
  plannerOpsPctDureeMax: 'of max duration',
  plannerOpsEmptyHint: 'Select a recipe to view its operations in detail',
  // Worker dashboard — KPI labels
  workerDashAvailablePlannings: 'Available plannings',
  workerDashLastPlanning: 'Last: ',
  workerDashNoPlannings: 'No planning',
  workerDashAssignedTasks: 'Assigned tasks',
  workerDashOrders: 'orders',
  workerDashProductionDuration: 'Production duration',
  workerDashFullDays: 'Full days',
  workerDashLessThanADay: 'Less than a day',
  workerDashPlanningStatus: 'Planning status',
  workerDashActivePlanning: 'Active planning',
  // Worker dashboard — error & empty states
  workerDashLoadError: 'Unable to load data',
  workerDashLoadErrorHint: 'Check that the server is reachable',
  workerDashRetry: 'Retry',
  workerDashNoPlanningAvailable: 'No planning available',
  workerDashNoPlanningHint: 'Plannings generated by the manager will appear here.',
  workerDashTableEmpty: 'No planning available.',
  // Worker dashboard — chart card titles & badges
  workerDashChartMachineLoad: 'Machine load — latest planning',
  workerDashBadgeOps: 'Operations',
  workerDashChartMakespan: 'Makespan history',
  workerDashBadgeDays: 'Days',
  workerDashChartOrders: 'Orders per planning',
  workerDashBadgeQty: 'Quantity',
  workerDashChartHistory: 'Full planning history',
  // Worker dashboard — history filter options
  workerDashFilterAll: 'All plannings',
  workerDashFilter10: 'Last 10',
  workerDashFilter20: 'Last 20',
  // Worker dashboard — table headers
  workerDashColId: '#',
  workerDashColDate: 'Generation date',
  workerDashColOrders: 'Orders',
  workerDashColLines: 'Lines',
  workerDashColStatus: 'Status',
  // Worker dashboard — chart internals
  workerDashAxisOps: 'Number of operations',
  workerDashDatasetMakespan: 'Makespan (days)',
  workerDashAxisPlanningNum: 'Planning number',
  workerDashAxisMakespanDays: 'Makespan (days)',
  workerDashDatasetOrders: 'Orders',
  workerDashAxisOrderCount: 'Number of orders',
  // Worker dashboard — shift labels
  workerDashShiftBefore: 'Before shift',
  workerDashShiftMorning: 'Morning — on shift',
  workerDashShiftLunch: 'Lunch break',
  workerDashShiftAfternoon: 'Afternoon — on shift',
  workerDashShiftEnd: 'End of shift',
  // Worker dashboard — clock sub-label
  workerDashClockDayPct: '% of day',
  // Planner dashboard — extra KPI labels
  plannerKpiEnAttenteLabel: 'awaiting scheduling',
  plannerKpiTotalPlannings: 'Total plannings',
  plannerKpiMoyenne: 'average',
  plannerKpiActifs: 'active',
  // Planner dashboard — delay alerts panel
  alertsTitle: 'Delay Alerts',
  alertsBadgeSuffix: 'alert(s)',
  alertsCriticalBadge: 'critical',
  alertsFilterAll: 'All',
  alertsFilterCritical: 'Critical',
  alertsFilterWarning: 'Warning',
  alertsFilterInfo: 'Info',
  alertsDismissAll: 'Dismiss all',
  alertsSeverityCritical: 'Critical',
  alertsSeverityWarning: 'Warning',
  alertsSeverityInfo: 'Info',
  alertsExportLabel: 'Export',
  alertsOverdueBy: 'Overdue by',
  alertsDaysLeft: 'Days left',
  alertsUrgent: 'URGENT',
  alertsDismissOne: 'Dismiss this alert',
  alertsAllClear: 'No active alerts.',
  alertsMsgOverdue: 'Overdue by {days} day(s)',
  alertsMsgDueToday: 'Due today',
  alertsMsgWarning: 'Due in {days} day(s)',
  alertsMsgInfo: 'Due in {days} day(s)',
  // Planner dashboard — bottleneck notification panel
  notifPanelTitle: 'Load Alerts',
  notifFilterAll: 'All',
  notifFilterOverloaded: 'Overloaded',
  notifFilterUnderused: 'Underused',
  notifFilterInactive: 'Inactive',
  notifTagOverloaded: 'Overloaded',
  notifTagUnderused: 'Underused',
  notifTagInactive: 'Inactive',
  notifDismissTitle: 'Dismiss alert for',
  notifEmpty: 'No active load alerts',
  notifFooterOverloaded: 'overloaded',
  notifFooterUnderused: 'underused',
  notifFooterInactive: 'inactive',
  notifFooterBalanced: 'Load balanced',
  notifDismissAll: 'Dismiss all',
  notifClose: 'Close',
  notifMsgOverloaded: 'Overloaded at {pct}% (threshold: {threshold}%). Overload risk.',
  notifMsgUnderused:  'Underused at {pct}% (threshold: {threshold}%). Capacity wasted.',
  notifMsgInactive:   'Machine inactive — no tasks scheduled.',
  // Admin users — additional keys
  clearSearch: 'Clear search',
  passwordMismatch: 'Passwords do not match',
  saving: 'Saving…',
  deleteUserTitle: 'Delete user',
  deleteUserConfirm: 'Are you sure you want to delete this user?',
  cancelBtn: 'Cancel',
  deleting: 'Deleting…',
  // Planner dashboard — deadline-compliance report section
  complianceSectionTitle: 'Export Date Compliance',
  complianceSectionSubtitle: 'On-time delivery rate against planned export dates',
  complianceDateFrom: 'From',
  complianceDateTo: 'To',
  complianceRunBtn: 'Generate',
  complianceRunningBtn: 'Computing…',
  complianceKpiRate: 'Compliance rate',
  complianceKpiOnTime: 'On time',
  complianceKpiLate: 'Late',
  complianceKpiPending: 'In progress',
  complianceKpiVariance: 'Avg. variance',
  complianceVarianceAhead: 'Avg. ahead',
  complianceVarianceBehind: 'Avg. behind',
  complianceChartTitle: 'Order breakdown',
  complianceChartBadge: 'total',
  complianceTableTitle: 'Order detail',
  complianceFilterAll: 'All',
  complianceFilterOnTime: 'On time',
  complianceFilterLate: 'Late',
  complianceFilterPending: 'In progress',
  complianceColCommande: 'Order',
  complianceColRecette: 'Recipe',
  complianceColDateExport: 'Export date',
  complianceColVariance: 'Variance',
  complianceColStatut: 'Status',
  complianceRowEmpty: 'No orders for this filter.',
  complianceEmptyHint: 'Click <strong>Generate</strong> to display the deadline compliance report.',
  complianceLoadError: 'Error loading the report.',
  complianceBadgeOnTime: 'On time',
  complianceBadgeLate: 'Late',
  complianceBadgePending: 'In progress',
  complianceChartLabelOnTime: 'On time',
  complianceChartLabelLate: 'Late',
  complianceChartLabelPending: 'In progress',
  complianceTooltipSuffix: 'order(s)',
  alertErrNetwork:             'Cannot reach the server. Make sure the .NET backend is running.',
  alertErrUnauthorized:        'Session expired (401). Please sign in again and retry.',
  alertErrForbidden:           'Access denied (403). Your role does not allow this alert action.',
  alertErrNotFound:            'Alert not found (404). It may have already been removed.',
  alertErrServer:              'Server error while processing alerts. Retry or contact your administrator.',
  alertErrRefreshFailed:       'Could not recompute alerts. Check the server connection.',
  alertErrDismissFailed:       'Could not dismiss this alert. Please try again in a moment.',
  alertErrDismissAllDelay:     'Could not dismiss all delay alerts. Please try again in a moment.',
  alertErrDismissAllBottleneck:'Could not dismiss all load alerts. Please try again in a moment.',
  alertErrLoadFailed:          'Could not load alerts. Make sure the server is reachable.',
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'denim-lang';
  lang = signal<Language>(this.getStoredLang());
  t = computed<Translations>(() => this.lang() === 'fr' ? FR : EN);

  toggle() {
    this.lang.update(l => l === 'fr' ? 'en' : 'fr');
    localStorage.setItem(this.STORAGE_KEY, this.lang());
  }

  private getStoredLang(): Language {
    if (typeof window === 'undefined') return 'fr';
    return (localStorage.getItem(this.STORAGE_KEY) as Language) || 'fr';
  }
}
