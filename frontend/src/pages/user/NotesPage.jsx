import { ResourceWorkspace } from "../../components/ResourceWorkspace";
import { userResourceConfigs } from "../../utils/resourceConfigs";

const NotesPage = () => <ResourceWorkspace {...userResourceConfigs.notes} />;

export default NotesPage;
