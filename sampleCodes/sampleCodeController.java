@Controller
@RequestMapping("/messages")
public class ProjectMessagesController {

  @Resource
  private ProjectMessagesService projectMessagesService;

  @RequestMapping(value="/getMessage", method = requestMethod.POST, produces="application/json")
  public ResponseEntity<ProjectMessagesDto> getMessages(@RequestParam(value = "code", defaultValue="") final String code) {
    return ResponseEntity.ok(projectMessagesService.getMessage(code));
  }
}
