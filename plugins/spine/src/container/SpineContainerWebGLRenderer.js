/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

/**
 * Renders this Game Object with the WebGL Renderer to the given Camera.
 * The object will not render if any of its renderFlags are set or it is being actively filtered out by the Camera.
 * This method should not be called directly. It is a utility function of the Render module.
 *
 * @method SpineContainerWebGLRenderer#renderWebGL
 * @since 3.50.0
 * @private
 *
 * @param {Phaser.Renderer.WebGL.WebGLRenderer} renderer - A reference to the current active WebGL renderer.
 * @param {Phaser.GameObjects.Container} container - The Game Object being rendered in this call.
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The Camera that is rendering the Game Object.
 * @param {Phaser.GameObjects.Components.TransformMatrix} parentMatrix - This transform matrix is defined if the game object is nested
 */
var SpineContainerWebGLRenderer = function (renderer, container, camera, parentMatrix)
{
    var plugin = container.plugin;
    var sceneRenderer = plugin.sceneRenderer;
    var children = container.list;

    if (children.length === 0)
    {
        if (sceneRenderer.batcher.isDrawing && renderer.finalType)
        {
            sceneRenderer.end();

            renderer.pipelines.rebind();
        }

        return;
    }

    var transformMatrix = container.localTransform;

    if (parentMatrix)
    {
        transformMatrix.loadIdentity();
        transformMatrix.multiply(parentMatrix);
        transformMatrix.translate(container.x, container.y);
        transformMatrix.rotate(container.rotation);
        transformMatrix.scale(container.scaleX, container.scaleY);
    }
    else
    {
        transformMatrix.applyITRS(container.x, container.y, container.rotation, container.scaleX, container.scaleY);
    }

    if (renderer.newType)
    {
        //  flush + clear if this is a new type
        renderer.pipelines.clear();

        sceneRenderer.begin();
    }

    var rendererNextType = renderer.nextTypeMatch;

    //  Force these to avoid batch flushing during SpineGameObject.renderWebGL
    renderer.nextTypeMatch = true;
    renderer.newType = false;

    for (var i = 0; i < children.length; i++)
    {
        var src = children[i];

        if (src.willRender(camera))
        {
            src.renderWebGL(renderer, src, camera, transformMatrix, container);
        }
    }

    renderer.nextTypeMatch = rendererNextType;

    if (!rendererNextType)
    {
        //  The next object in the display list is not a Spine Game Object or Spine Container, so we end the batch
        sceneRenderer.end();

        //  And rebind the previous pipeline
        renderer.pipelines.rebind();
    }
};

module.exports = SpineContainerWebGLRenderer;
