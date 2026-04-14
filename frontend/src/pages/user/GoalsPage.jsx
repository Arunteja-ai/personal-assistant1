import { ResourceWorkspace } from "../../components/ResourceWorkspace";
import { userResourceConfigs } from "../../utils/resourceConfigs";

const GoalsPage = () => <ResourceWorkspace {...userResourceConfigs.goals} />;

export default GoalsPage;
