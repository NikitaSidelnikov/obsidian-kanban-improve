import { getStateManager } from './main';
import { removeEntity } from 'src/dnd/util/data';

export function getMovementParam(properties, property) {
  const frontmatter = properties
  const param = property
  const value = typeof frontmatter?.[param] === "string"?(frontmatter?.[param]?.toLowerCase()):null
  return value
}

export function getBoardsList(currentBoardPath: string) {
  // Get movementId of current board
  const currentCache = this.app.metadataCache.getCache(currentBoardPath);
  const currentFrontmatter = currentCache?.frontmatter
  const currentMovement = getMovementParam(currentFrontmatter, "kanban-movement")
  //const currentMovementInput = getMovementParam(currentFrontmatter, "kanban-movement-input") ?? currentMovement
  const currentMovementOutput = getMovementParam(currentFrontmatter, "kanban-movement-output") ?? currentMovement
  const currentMovementGroup = getMovementParam(currentFrontmatter, "kanban-movement-group")
  
  const files = this.app.vault.getMarkdownFiles();
  const boards: any[] = [];
  for (const file of files) {
    //if (file.path === currentBoardPath || file.path.contains('Kanban-ToDo-Template.md')) continue;
	const cache = app.metadataCache.getFileCache(file);
    const boardFrontmatter = cache?.frontmatter

    if (file.path === currentBoardPath || boardFrontmatter?.["kanban-plugin"] === null) continue;
	

    const boardMovement = getMovementParam(boardFrontmatter, "kanban-movement")
    const boardMovementInput = getMovementParam(boardFrontmatter, "kanban-movement-input") ?? boardMovement
    //const boardMovementOutput = getMovementParam(boardFrontmatter, "kanban-movement-output") ?? boardMovement
    const boardMovementGroup = getMovementParam(boardFrontmatter, "kanban-movement-group")

    if(currentMovementOutput === 'allow' && boardMovementInput === 'allow') {
	  boards.push({ path: file.path, name: file.name, boardMovementGroup });
	}
    else if((['allow', 'group']).includes(currentMovementOutput) && (['allow', 'group']).includes(boardMovementInput) && currentMovementGroup === boardMovementGroup && (currentMovementGroup && boardMovementGroup) != null) {
	  boards.push({ path: file.path, name: file.name, boardMovementGroup });
	}
	else if((['allow', 'disallowgroup']).includes(currentMovementOutput) && (['allow', 'disallowgroup']).includes(boardMovementInput) && (currentMovementGroup !== boardMovementGroup ||  (currentMovementGroup &&  boardMovementGroup) == null)) {
	  boards.push({ path: file.path, name: file.name, boardMovementGroup });
	}
  }
  return boards.sort((a,b) => (a.name).localeCompare(b.name));
}

export async function moveCardToBoard(path: String, cardText: String) {
	const file = this.app.vault.getFileByPath(path)

	let content: string = await this.app.vault.read(file)

	let lines = content.split('\n');
    let firstLaneStartIndex = -1;
	for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) {
        if (firstLaneStartIndex === -1) {
          firstLaneStartIndex = i;
		  break;
        }
      }
    }

    if (firstLaneStartIndex === -1) {
      // If we haven't found any columns, then we'll create the first column and add a card
      lines.push('## Inbox');
      lines.push('');
      lines.push(cardText);
    } else {
      // Find a place to insert in the first column
      let insertIndex = firstLaneStartIndex + 1;
      lines.splice(insertIndex, 0, cardText);
    }
    const newContent = lines.join('\n');
    this.app.vault.modify(file, newContent);
}