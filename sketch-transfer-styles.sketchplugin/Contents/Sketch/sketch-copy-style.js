// Functions
const copyInstanceSharedTextStyle = (context, instance) => context.document.documentData().layerTextStyles().sharedStyleForInstance( instance.style() );
const copyInstanceSharedLayerStyle = (context, instance) => context.document.documentData().layerStyles().sharedStyleForInstance( instance.style() );
const pasteInstanceSharedStyle = ( layer, sharedStyle ) => layer.style = sharedStyle.newInstance();

// Main Function
const transferStyle = ( context, original, targets ) => {
  // Filter target layers by original class
  const originalClass = original.class();
  const targetsFiltered = targets.slice().filter(layer => layer.class() == originalClass)

  // Processing targets layers
  targetsFiltered.map( layer => {
    // Get layers from original
    let copyStyle;
    if (original.class() == 'MSTextLayer') {
      copyStyle = copyInstanceSharedTextStyle( context, original );
    }
    if (original.class() == 'MSShapeGroup') {
      copyStyle = copyInstanceSharedLayerStyle( context, original );
    }
    pasteInstanceSharedStyle ( layer, copyStyle );
  });
}

function transfer (context) {
  // Consts
  const SELECTION = context.selection;

  // Layers
  const original = SELECTION[0];
  const targets = SELECTION.slice(1, SELECTION.length);

  if (SELECTION.length > 1){
    // Transfer Style!
    transferStyle( context, original, targets );
    // MSG
    context.document.showMessage("💅🏻 Styles copied!");
  } else {
    // MSG
    context.document.showMessage("💩 Select one original layer and target layers");
  }
}
