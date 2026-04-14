import { ResourceWorkspace } from "../../components/ResourceWorkspace";
import { userResourceConfigs } from "../../utils/resourceConfigs";

const DailyLogsPage = () => <ResourceWorkspace {...userResourceConfigs["daily-logs"]} />;

export default DailyLogsPage;
