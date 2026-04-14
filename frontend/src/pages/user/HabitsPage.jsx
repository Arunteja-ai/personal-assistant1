import { ResourceWorkspace } from "../../components/ResourceWorkspace";
import { userResourceConfigs } from "../../utils/resourceConfigs";

const HabitsPage = () => <ResourceWorkspace {...userResourceConfigs.habits} />;

export default HabitsPage;
