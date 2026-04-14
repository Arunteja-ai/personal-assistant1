import { ResourceWorkspace } from "../../components/ResourceWorkspace";
import { userResourceConfigs } from "../../utils/resourceConfigs";

const TodosPage = () => <ResourceWorkspace {...userResourceConfigs.todos} />;

export default TodosPage;
