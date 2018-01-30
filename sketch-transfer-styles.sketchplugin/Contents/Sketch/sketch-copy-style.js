// Functions
const copyInstanceSharedTextStyle = ( context, instance ) => context.document.documentData().layerTextStyles().sharedStyleForInstance( instance.style() );
const copyInstanceSharedLayerStyle = ( context, instance ) => context.document.documentData().layerStyles().sharedStyleForInstance( instance.style() );
const pasteInstanceSharedStyle = ( layer, sharedStyle ) => layer.style = sharedStyle.newInstance();
const copyInstanceSharedStyle = ( context, instance, klass ) => {
  if ( klass == 'MSTextLayer' )
    return copyInstanceSharedTextStyle( context, instance );
  if ( klass == 'MSShapeGroup' )
    return copyInstanceSharedLayerStyle( context, instance );
  return null;
}

const writeFile = (filename, the_string) => {
  const path =[@"" stringByAppendingString: filename];
  const str = [@"" stringByAppendingString: the_string];
  str.dataUsingEncoding_(NSUTF8StringEncoding).writeToFile_atomically_(path, true);
}

const readFile = filePath => {
  const fileContents = NSString.stringWithContentsOfFile(filePath);
  return JSON.parse(fileContents.toString());
}

const transferStyle = ( context, original, targets ) => {
  // Filter target layers by original class
  const originalClass = original.class();
  const targetsFiltered = targets.slice().filter( layer => layer.class() == originalClass );

  // Processing targets layers
  targetsFiltered.map( layer => {
    const klass = original.class();
    copyStyle = copyInstanceSharedStyle( context, original, klass );
    pasteInstanceSharedStyle ( layer, copyStyle );
  });
}

const findLayersByID = ( oid, scope ) => {
  const predicate = NSPredicate.predicateWithFormat( "objectID == %@", oid );
  return scope.filteredArrayUsingPredicate( predicate );
}

function copyStyle ( context ) {
  const objectID = context.selection[0].objectID();
  writeFile(`${NSHomeDirectory()}/.sketch-copy-style.json`, JSON.stringify({id:objectID+""}));
}

function paste ( context ) {
  // Layers
  const allFilesWidthObjectId = context.document.currentPage().layers().slice().map(ab => findLayersByID( readFile( `${NSHomeDirectory()}/.sketch-copy-style.json` ).id, ab.layers() ))
  const original = allFilesWidthObjectId.slice().filter(l => l.length)[0][0]
  const targets = context.selection;
  if ( context.selection.length >= 1 ){
    transferStyle( context, original, targets );
    context.document.showMessage( '💅🏻 Styles copied!' );
  }

}
