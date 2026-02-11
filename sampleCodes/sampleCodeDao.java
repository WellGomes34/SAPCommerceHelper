public class DefaultProjectMessages implements ProjectMessagesDao {
  @Resource
  private FlexibleSearchService flexibleSearchService;

  protected static final String MESSAGES_QUERY = "SELECT {PK} FROM {Messages} WHERE {id} = ?id";

  @Override
  public ProjectMessagesModel findMessageById(String id) {
    final FlexibleSearchQuery flexibleSearchQuery = new FlexibleSearchQuery(MESSAGES_QUERY);
    flexibleSearchQuery.addQueryParameter("id", id);
    final SearchResult<ProjectMessagesModel> result = getFlexibleSearchService().search(flexibleSearchQuery);
    if(result.getCount() == 0) {
      return null;
    }
    return result.getResult().get(0);
  }

  public FlexibleSearchService getFlexibleSearchService() {
    return flexibleSearchService;
  }
}
