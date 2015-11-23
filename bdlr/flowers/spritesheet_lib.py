import os

from PIL import Image
from django.conf import settings


CSS_TEMPLATE = """
body:after{
    display:none;
    content: url(/static/spritesheet/%s);
}

.sprite-sheet-%s {
    background: url("/static/spritesheet/%s"), no-repeat;
    display: block;
}
"""

CSS_SS_ITEM_TEMPLATE = """.sprite-%s {
    width: %spx;
    height: %spx;
    background-position: -%spx %spx;
    float: right;
}
"""


def create_sprite_css(name_to_image_path_dict, chunk_index):
    """
    :param name_to_image_path_dict:
    :return:
    """
    ss_path, ss_coords = create_sprite_sheet(name_to_image_path_dict)
    base_ss_name = os.path.basename(ss_path)
    css_text = CSS_TEMPLATE % (base_ss_name, chunk_index, base_ss_name)

    for name, coords in ss_coords.items():
        css_text += CSS_SS_ITEM_TEMPLATE % (name, coords[0], coords[1], coords[2], coords[3])

    return css_text


def create_sprite_sheet(name_to_image_path_dict):
    """
    Create a sprite sheet from the images in the paths that are the values of the above dictionary. Keys are the names
    of the images, used for the output.
    :param name_to_image_path_dict: Dictionary of image names (not file paths, logical names) to image file paths, to
    create a sprite sheet out of.
    :return: image path on server, dictionary of image name (from the input) to (x, y, w, h) of image location in the
    sprite sheet.
    """
    images = {name: Image.open(os.path.join(settings.PAINTINGS_DIR, os.path.basename(file_path.replace("\\", "/"))))
              for name, file_path in name_to_image_path_dict.items()}
    image_to_location = {}

    name = "-".join(name_to_image_path_dict.keys())
    output_file = os.path.join(settings.SPRITE_SHEET_DIR, "%s.%s" % (name, settings.SPRITE_SHEET_FILETYPE))
    image_exists = os.path.isfile(output_file)

    master_height = max([i.size[1] for i in images.values()])  # Make it as high as the highest image
    master_width = sum([i.size[0] for i in images.values()])   # and as wide as all of them together

    if not image_exists:
        master = Image.new(
            mode='RGBA',
            size=(master_width, master_height),
            color=(0, 0, 0, 0))  # fully transparent

    cur_width = 0
    for count, name in enumerate(images.keys()):
        image = images[name]
        if not image_exists:
            master.paste(image, (cur_width, 0))
            
        image_to_location[name] = (image.size[0], image.size[1], cur_width, 0)
        cur_width += image.size[0]

    if not image_exists:
        if "gif" == settings.SPRITE_SHEET_FILETYPE:
            master.save(output_file, transparency=0)
        else:
            master.save(output_file)

    return output_file, image_to_location