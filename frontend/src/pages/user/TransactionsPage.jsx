import { ResourceWorkspace } from "../../components/ResourceWorkspace";
import { userResourceConfigs } from "../../utils/resourceConfigs";

const TransactionsPage = () => <ResourceWorkspace {...userResourceConfigs.transactions} />;

export default TransactionsPage;
