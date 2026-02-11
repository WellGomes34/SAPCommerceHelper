public class DefaultProjectMessages implements ProjectMessagesService {
  @Resource
  private ProjectMessagesDao projectMessagesDao;

  @Override
  public ProjectMessagesDto getMessage (String id) {
    ProjectMessagesDto projectMessagesDto = new ProjectMessagesDto();

    ProjectMessagesModel projectMessagesModel = projectMessagesDao.findMessageById(id);

    if(projectMessagesModel != null) {
      projectMessagesDto.setId(projectMessagesModel.getId());
      projectMessagesDto.setText(projectMessagesModel.getText());
      
      return projectMessagesDto;
    }

    return null;
  }
}
