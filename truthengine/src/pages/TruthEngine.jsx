import { useState } from "react";
import { P } from "../lib/teData";
import TENav from "../components/te/TENav";
import SearchTab from "../components/te/SearchTab";
import DCASTab from "../components/te/DCASTab";
import VeteransTab from "../components/te/VeteransTab";
import FOIATab from "../components/te/FOIATab";
import CrawlersTab from "../components/te/CrawlersTab";
import PlatformTab from "../components/te/PlatformTab";
import LitcentralTab from "../components/te/LitcentralTab";
import BriefingTab from "../components/te/BriefingTab";
import PredictiveAnalytics from "../components/te/PredictiveAnalytics";
import CaseAlerts from "../components/te/CaseAlerts";
import ReportBuilder from "../components/te/ReportBuilder";
import NetworkGraph from "../components/te/NetworkGraph.jsx";
import FOIAAutomation from "../components/te/FOIAAutomation";
import PDFExtraction from "../components/te/PDFExtraction";
import TradecraftTab from "../components/te/TradecraftTab";
import TradecraftAgencyMap from "../components/te/TradecraftAgencyMap";
import AdvancedMLFramework from "../components/te/AdvancedMLFramework";
import ResearchInquiry from "../components/te/ResearchInquiry";
import LiveMarquee from "../components/te/LiveMarquee";
import PlatformOverviewEmail from "../components/te/PlatformOverviewEmail";
import ScholarSearch from "../components/te/ScholarSearch";
import MilitaryNaturalizationPanel from "../components/te/MilitaryNaturalizationPanel";
import MilitaryDBs from "../components/te/MilitaryDBs";
import ChurnModel from "../components/te/ChurnModel";
import ForensicAudit from "../components/te/ForensicAudit";
import SDSUCollections from "../components/te/SDSUCollections";
import PolicyImpact from "../components/te/PolicyImpact";
import EvidenceMapper from "../components/te/EvidenceMapper";
import OutreachDashboard from "../components/te/OutreachDashboard";
import DatabasesPanel from "../components/te/DatabasesPanel";
import AnalyticsHub from "../components/te/AnalyticsHub";
import CensusExplorer from "../components/te/CensusExplorer";
import EvidenceTimeline from "../components/te/EvidenceTimeline";
import FOIAMap from "../components/te/FOIAMap";
import NaturalizationSim from "../components/te/NaturalizationSim";
import DeportationRiskEngine from "../components/te/DeportationRiskEngine";
import VeteranMap from "../components/te/VeteranMap";
import CHCBriefingGenerator from "../components/te/CHCBriefingGenerator";
import CHCBriefingDashboard from "../components/te/CHCBriefingDashboard";
import CHCBriefingExporter from "../components/te/CHCBriefingExporter";
import CantonCongressionalCase from "../components/te/CantonCongressionalCase";
import FOIATracker from "../components/te/FOIATracker";
import GeoEvidenceMap from "../components/te/GeoEvidenceMap";
import N8nPipeline from "../components/te/N8nPipeline";
import EnhancedSearch from "../components/te/EnhancedSearch";
import FOIARequestManager from "../components/te/FOIARequestManager";
import UniversityOutreachCRM from "../components/te/UniversityOutreachCRM";
import ForensicExportModule from "../components/te/ForensicExportModule";
import EvidenceGraph from "../components/te/EvidenceGraph";
import TE360Assistant from "../components/te/TE360Assistant";
import CaseEvidenceViewer from "../components/te/CaseEvidenceViewer";
import CHCReportGenerator from "../components/te/CHCReportGenerator";
import InteractiveDashboard from "../components/te/InteractiveDashboard";
import ICELookupPanel from "../components/te/ICELookupPanel";
import KnowledgeBase from "../components/te/KnowledgeBase";
import MissingDetentionHub from "../components/te/MissingDetentionHub";
import AutoEvidenceScraper from "../components/te/AutoEvidenceScraper";
import InteractiveRiskEngine from "../components/te/InteractiveRiskEngine";
import CaseTimelineVisualizer from "../components/te/CaseTimelineVisualizer";
import CaseExportWorkflow from "../components/te/CaseExportWorkflow";
import CaseExplorer from "../components/te/CaseExplorer";
import InstitutionalGapTracker from "../components/te/InstitutionalGapTracker";
import VeteranDataDashboard from "../components/te/VeteranDataDashboard";
import CrossBorderSearchTool from "../components/te/CrossBorderSearchTool";
import NavigationChatbox from "../components/te/NavigationChatbox";
import InteractiveVeteranMap from "../components/te/InteractiveVeteranMap";
import DeportationRiskDashboard from "../components/te/DeportationRiskDashboard";
import NotificationSystem from "../components/te/NotificationSystem";
import ActionRequiredDashboard from "../components/te/ActionRequiredDashboard";
import CHCInquiryLetterGenerator from "../components/te/CHCInquiryLetterGenerator";
import PTSDDeportationAnalyzer from "../components/te/PTSDDeportationAnalyzer";
import ExportHub from "../components/te/ExportHub";
import PTSDCrimeAnalysis from "../components/te/PTSDCrimeAnalysis";
import BulkEvidenceDossier from "../components/te/BulkEvidenceDossier";
import GeospatialDashboard from "../components/te/GeospatialDashboard";
import IntakeMapDashboard from "../components/te/IntakeMapDashboard";
import NERORadialGraph from "../components/te/NERORadialGraph";
import CHCAutomatedReportBuilder from "../components/te/CHCAutomatedReportBuilder";
import CaseDetailView from "../components/te/CaseDetailView";
import PolicyImpactDashboard from "../components/te/PolicyImpactDashboard";
import UniversalSearchPanel from "../components/te/UniversalSearchPanel";
import KnowledgeBaseManager from "../components/te/KnowledgeBaseManager";
import SystemAlerts from "../components/te/SystemAlerts";
import ResearchSearch from "../components/te/ResearchSearch";
import DeploymentStatus from "../components/te/DeploymentStatus";
import LegislativeBriefingMode from "../components/te/LegislativeBriefingMode";
import ComprehensiveReportViewer from "../components/te/ComprehensiveReportViewer";
import InteractivePolicyMap from "../components/te/InteractivePolicyMap";
import VeteranLifeEventTimeline from "../components/te/VeteranLifeEventTimeline";
import MLRiskEngine from "../components/te/MLRiskEngine";
import MLModelsComparison from "../components/te/MLModelsComparison";
import MLAlgorithmExplorer from "../components/te/MLAlgorithmExplorer";
import BorderShelterMap from "../components/te/BorderShelterMap";
import N8nIntegration from "../components/te/N8nIntegration";
import PieChartReports from "../components/te/PieChartReports";
import ExilePatriotProject from "../components/te/ExilePatriotProject";
import PDFBriefingGenerator from "../components/te/PDFBriefingGenerator";
import TimelineHistorical from "../components/te/TimelineHistorical";
import ReportScheduler from "../components/te/ReportScheduler";
import UnifiedDataMap from "../components/te/UnifiedDataMap";
import VeteranAdvocacyGIS from "../components/te/VeteranAdvocacyGIS";
import VeteranForensicInvestigation from "../components/te/VeteranForensicInvestigation";
import HomeRecordDensityHeatmap from "../components/te/HomeRecordDensityHeatmap";
import MexicanNationalForensicReport from "../components/te/MexicanNationalForensicReport";
import MexicanKIAReport from "../components/te/MexicanKIAReport";
import ReportGeneratorHub from "../components/te/ReportGeneratorHub";
import DeportationVeteranMapLayer from "../components/te/DeportationVeteranMapLayer";
import ForensicLeadsTimeSeries from "../components/te/ForensicLeadsTimeSeries";
import InsightsDashboard from "../components/te/InsightsDashboard";
import ResearchDatabasePlatform from "../components/te/ResearchDatabasePlatform";
import ResearchDBExpansion from "../components/te/ResearchDBExpansion";
import BlueprintViewer from "../components/te/BlueprintViewer";
import SocialListeningPlatform from "../components/te/SocialListeningPlatform";
import ChicanoMilitaryCasualtyAnalytics from "../components/te/ChicanoMilitaryCasualtyAnalytics";
import Tier4Archives from "../components/te/Tier4Archives";
import SourceRegistryDashboard from "../components/te/SourceRegistryDashboard";
import EvidenceLinker from "../components/te/EvidenceLinker";
import ArchitectureAudit from "../components/te/ArchitectureAudit";
import EBSCOResearchStarters from "../components/te/EBSCOResearchStarters";
import CaptureRecaptureEstimator from "../components/te/CaptureRecaptureEstimator";
import DeportationProceedingsPanel from "../components/te/DeportationProceedingsPanel";
import MexicoShelterPanel from "../components/te/MexicoShelterPanel";
import CaseFileBulkUpload from "../components/te/CaseFileBulkUpload";
import ForensicResearchHub from "../components/te/ForensicResearchHub";
import ShelterMapView from "../components/te/ShelterMapView";
import IntelReportGenerator from "../components/te/IntelReportGenerator";
import ExpansionRoadmap from "../components/te/ExpansionRoadmap";
import DatabaseMasterIndex from "../components/te/DatabaseMasterIndex";
import OmegaResearchEngine from "../components/te/OmegaResearchEngine";
import CrossBorderPhase1Panel from "../components/te/CrossBorderPhase1Panel";
import BehaviorVectorDashboard from "../components/te/BehaviorVectorDashboard";
import FOIAEscalationLetters from "../components/te/FOIAEscalationLetters";
import ForensicCommandCenter from "../components/te/ForensicCommandCenter";
import EvidenceVaultPanel from "../components/te/EvidenceVaultPanel";
import ClaimEnginePanel from "../components/te/ClaimEnginePanel";
import MilitaryResearchDBPanel from "../components/te/MilitaryResearchDBPanel";

export default function TruthEngine() {
  const [tab, setTab] = useState("home");
  const [chatboxOpen, setChatboxOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, title, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    return id;
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div style={{ background:P.bg, minHeight:"100vh", fontFamily:"'IBM Plex Mono',monospace", color:P.t1, overflowX:"hidden", paddingBottom:40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700;800&display=swap');
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#1A2E5C}
        ::-webkit-scrollbar-thumb{background:#FCD34D;border-radius:3px}
        * { box-sizing: border-box; }
        a { color: inherit; }
        button { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <TENav tab={tab} setTab={setTab} />

      {tab === "home"       && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><InteractiveDashboard setTab={setTab} /></div>}
      {tab === "vetdash"     && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><VeteranDataDashboard /></div>}
      {tab === "border"      && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CrossBorderSearchTool /></div>}
      {tab === "detentionhub" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><MissingDetentionHub /></div>}
      {tab === "autoscraper"  && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><AutoEvidenceScraper /></div>}
      {tab === "riskengine2"  && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><InteractiveRiskEngine /></div>}
      {tab === "casetimeline" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CaseTimelineVisualizer /></div>}
      {tab === "caseexplorer" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><CaseExplorer /></div>}
      {tab === "knowledgebase" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><KnowledgeBase /></div>}
      {tab === "icelookup"   && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ICELookupPanel /></div>}
      {tab === "caseexport"  && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CaseExportWorkflow /></div>}
      {tab === "gaptracker"  && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><InstitutionalGapTracker /></div>}
      {tab === "search"    && <SearchTab setTab={setTab} />}
      {tab === "dcas"      && <DCASTab />}
      {tab === "veterans"  && <VeteransTab />}
      {tab === "foia"      && <FOIATab />}
      {tab === "crawlers"  && <CrawlersTab />}
      {tab === "platform"  && <PlatformTab />}
      {tab === "litcentral"  && <LitcentralTab />}
      {tab === "briefing"    && <BriefingTab />}
      {tab === "predictive"  && <PredictiveAnalytics />}
      {tab === "foia-auto"   && <FOIAAutomation />}
      {tab === "pdf"         && <PDFExtraction />}
      {tab === "alerts"      && <CaseAlerts />}
      {tab === "report"      && <ReportBuilder />}
      {tab === "network"     && <NetworkGraph />}
      {tab === "tradecraft"   && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><TradecraftAgencyMap /></div>}
      {tab === "scholar"      && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ScholarSearch /></div>}
      {tab === "milnat" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><MilitaryNaturalizationPanel /></div>}
      {tab === "militarydbs"   && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><MilitaryDBs /></div>}
      {tab === "churn"         && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ChurnModel /></div>}
      {tab === "forensicaudit" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ForensicAudit /></div>}
      {tab === "sdsu"          && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><SDSUCollections /></div>}
      {tab === "evidencemap"   && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><EvidenceMapper /></div>}
      {tab === "outreach"      && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><OutreachDashboard /></div>}
      {tab === "riskengine"    && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><DeportationRiskEngine /></div>}
      {tab === "analytics"     && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ResearchInquiry /></div>}
      {tab === "databases"     && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><DatabasesPanel /></div>}
      {tab === "census"        && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CensusExplorer /></div>}
      {tab === "evidtimeline"    && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><EvidenceTimeline /></div>}
      {tab === "vetmap"         && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><VeteranMap /></div>}
      {tab === "chcgen"         && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CHCBriefingGenerator /></div>}
      {tab === "foiatrack"       && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><FOIATracker /></div>}
      {tab === "geoevidmap"      && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><GeoEvidenceMap /></div>}
      {tab === "n8npipe"         && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><N8nPipeline /></div>}
      {tab === "enhsearch"        && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><EnhancedSearch /></div>}
      {tab === "foiamanager"        && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><FOIARequestManager /></div>}
      {tab === "unioutreach"        && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><UniversityOutreachCRM /></div>}
      {tab === "forensicexp"        && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ForensicExportModule /></div>}
      {tab === "evidgraph"        && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><EvidenceGraph /></div>}
      {tab === "assistant"        && <TE360Assistant />}
      {tab === "evidence"         && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CaseEvidenceViewer /></div>}
      {tab === "chcreport"        && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CHCReportGenerator /></div>}
      {tab === "chcbriefing"      && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><CHCBriefingDashboard /></div>}
      {tab === "chcexport"        && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CHCBriefingExporter /></div>}
      {tab === "canton"           && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CantonCongressionalCase /></div>}
      {tab === "foiamap"        && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><FOIAMap /></div>}
      {tab === "natsim"         && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><NaturalizationSim /></div>}
      {tab === "map"            && <InteractiveVeteranMap />}
      {tab === "riskscore"      && <DeportationRiskDashboard />}
      {tab === "chcinquiry"     && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CHCInquiryLetterGenerator /></div>}
      {tab === "ptsdanalyzer"    && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><PTSDDeportationAnalyzer /></div>}
      {tab === "ptsdcrime"       && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><PTSDCrimeAnalysis /></div>}
      {tab === "exporthub"      && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ExportHub /></div>}
      {tab === "grants"         && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><PlatformOverviewEmail /></div>}
      {tab === "bulkdossier"     && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><BulkEvidenceDossier /></div>}
      {tab === "geomapping"      && <GeospatialDashboard />}
      {tab === "intakemap"       && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><IntakeMapDashboard /></div>}
      {tab === "nero"            && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><NERORadialGraph /></div>}
      {tab === "chcreportbuild"  && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CHCAutomatedReportBuilder /></div>}
      {tab === "casedetail"      && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CaseDetailView caseId="C004" /></div>}
      {tab === "policymap" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><InteractivePolicyMap /></div>}
      {tab === "veteran-timeline" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><VeteranLifeEventTimeline /></div>}
      {tab === "mlrisk" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><MLRiskEngine /></div>}
      {tab === "mlmodels" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><MLModelsComparison /></div>}
      {tab === "mlexplorer" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><MLAlgorithmExplorer /></div>}
      {tab === "sheltermap" && <BorderShelterMap />}
      {tab === "n8n" && <N8nIntegration />}
      {tab === "piecharts" && <PieChartReports />}
      {tab === "exile" && <ExilePatriotProject />}
      {tab === "pdfbrief" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><PDFBriefingGenerator /></div>}
      {tab === "timeline" && <TimelineHistorical setTab={setTab} />}
      {tab === "scheduler" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><ReportScheduler setTab={setTab} /></div>}
      {tab === "datamap" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><UnifiedDataMap /></div>}
      {tab === "advocacygis" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><VeteranAdvocacyGIS /></div>}
      {tab === "forensic" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><VeteranForensicInvestigation /></div>}
      {tab === "horheatmap" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><HomeRecordDensityHeatmap /></div>}
      {tab === "mexreport" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><MexicanNationalForensicReport /></div>}
      {tab === "mxkia" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><MexicanKIAReport /></div>}
      {tab === "forensicseries" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ForensicLeadsTimeSeries /></div>}
      {tab === "actionrequired" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ActionRequiredDashboard setTab={setTab} /></div>}
      {tab === "insights" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><InsightsDashboard /></div>}
      {tab === "researchdb" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ResearchDatabasePlatform /></div>}
      {tab === "dbexpansion" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ResearchDBExpansion /></div>}
      {tab === "blueprint" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><BlueprintViewer /></div>}
      {tab === "policy" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><PolicyImpactDashboard /></div>}
      {tab === "researchsearch" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ResearchSearch /></div>}
      {tab === "legislative" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><LegislativeBriefingMode /></div>}
      {tab === "comprehensive" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ComprehensiveReportViewer /></div>}
      {tab === "reportgen" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ReportGeneratorHub /></div>}
      {tab === "deportmap" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><DeportationVeteranMapLayer /></div>}
      {tab === "deployment" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><DeploymentStatus /></div>}
      {tab === "social" && <div style={{ height:"calc(100vh - 118px)", overflow:"hidden", display:"flex", flexDirection:"column" }}><SocialListeningPlatform /></div>}
      {tab === "chicano" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><ChicanoMilitaryCasualtyAnalytics /></div>}
      {tab === "tier4" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><Tier4Archives /></div>}
      {tab === "sourceregistry" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><SourceRegistryDashboard /></div>}
      {tab === "evidencelinker" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><EvidenceLinker /></div>}
      {tab === "archaudit" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><ArchitectureAudit /></div>}
      {tab === "ebsco" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><EBSCOResearchStarters /></div>}
      {tab === "capturecapture" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CaptureRecaptureEstimator /></div>}
      {tab === "forensichub" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><ForensicResearchHub /></div>}
      {tab === "bulkupload" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><CaseFileBulkUpload /></div>}
      {tab === "deportproceedings" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><DeportationProceedingsPanel /></div>}
      {tab === "mexicoshelters" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><MexicoShelterPanel /></div>}
      {tab === "sheltermap2" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><ShelterMapView /></div>}
      {tab === "intelreport" && <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 118px)" }}><IntelReportGenerator /></div>}
      {tab === "expansionroadmap" && <ExpansionRoadmap />}
      {tab === "dbmaster" && <DatabaseMasterIndex />}
      {tab === "omega" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><OmegaResearchEngine /></div>}
      {tab === "cbphase1" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><CrossBorderPhase1Panel /></div>}
      {tab === "behaviorvectors" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><BehaviorVectorDashboard /></div>}
      {tab === "foiaescalation" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><FOIAEscalationLetters /></div>}
      {tab === "forensiccc" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><ForensicCommandCenter /></div>}
      {tab === "evidencevault" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><EvidenceVaultPanel /></div>}
      {tab === "claimengine" && <div style={{ padding:"0", height:"calc(100vh - 118px)", display:"flex", overflow:"hidden" }}><ClaimEnginePanel /></div>}
      {tab === "milresearchdb" && <div style={{ padding:"0", overflowY:"auto", height:"calc(100vh - 118px)" }}><MilitaryResearchDBPanel /></div>}

      <NotificationSystem notifications={notifications} onDismiss={dismissNotification} />
      <NavigationChatbox visible={chatboxOpen} onNavigate={t => { setTab(t); setChatboxOpen(false); }} />
      <LiveMarquee />

      <button
        onClick={() => setNotifications((prev) => [
          ...prev,
          { id: Date.now(), type: "critical", title: "Document Linked", message: "Evidence doc linked to C004 (CRITICAL)" },
        ])}
        style={{
          position: "fixed",
          bottom: 120,
          right: 20,
          width: 50,
          height: 50,
          background: `${P.red}22`,
          border: `1px solid ${P.red}`,
          borderRadius: "50%",
          color: P.red,
          fontSize: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 998,
          fontWeight: 800,
          title: "Test Notification",
        }}
      >
        🔔
      </button>
      <button onClick={() => setChatboxOpen(!chatboxOpen)}
        style={{ position:"fixed", bottom:60, right:20, width:50, height:50,
          background:chatboxOpen?`${P.gold}`:`${P.gold}22`, border:`1px solid ${chatboxOpen?P.gold:P.b}`,
          borderRadius:"50%", color:chatboxOpen?"#000":P.gold, fontSize:20,
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:999, fontWeight:800, title:"Vato Chat" }}>🪖</button>
    </div>
  );
}