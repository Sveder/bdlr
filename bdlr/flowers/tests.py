import os

from django.test import TestCase

import spritesheet_lib


IMAGE_DIR = os.path.join("assets", "paintings")
FIRST_IMAGE = os.path.join(IMAGE_DIR, "1.jpg")
SECOND_IMAGE = os.path.join(IMAGE_DIR, "2.jpg")
THIRD_IMAGE = os.path.join(IMAGE_DIR, "3.jpg")
FOURTH_IMAGE = os.path.join(IMAGE_DIR, "4.jpg")



class SpriteSheetLibTest(TestCase):
    def test_create_sprite_sheet(self):
        """
        Test: Call create_sprite_sheet with valid paths.
        Expected result: A sprite sheet will be created and the returned values will correspond to the images EXACTLY.
        """
        name_to_image = {
            "first" : FIRST_IMAGE,
            "second" : SECOND_IMAGE,
            "third" : THIRD_IMAGE,
            "fourth" : FOURTH_IMAGE,
        }
        ss_location, locations = spritesheet_lib.create_sprite_sheet(name_to_image)

    def test_create_sprite_css(self):
        """
        Test: Call create_sprite_css with valid paths.
        Expected result: A sprite css text will be created and should have the right values.
        """
        name_to_image = {
            "1" : FIRST_IMAGE,
            "2" : SECOND_IMAGE,
            "3" : THIRD_IMAGE,
            "4" : FOURTH_IMAGE,
        }
        css_txt = spritesheet_lib.create_sprite_css(name_to_image)
        import pdb;pdb.set_trace()


