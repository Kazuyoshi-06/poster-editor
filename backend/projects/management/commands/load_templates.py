from typing import Any
from django.core.management.base import BaseCommand
from projects.models import Template


class Command(BaseCommand):
    help = "Load predefined templates into the database"

    def handle(self, *args: Any, **options: Any) -> None:
        """Create 5 predefined templates for the poster editor."""
        templates_data = [
            {
                "name": "Yu-Gi-Oh Tournament",
                "category": "tournament",
                "canvas_data": {
                    "width": 794,
                    "height": 1123,
                    "background": {
                        "type": "color",
                        "value": "#000000"
                    },
                    "objects": [
                        {
                            "type": "text",
                            "id": "title",
                            "x": 0,
                            "y": 150,
                            "text": "YU-GI-OH TOURNAMENT",
                            "fontSize": 72,
                            "fontFamily": "Bebas Neue",
                            "fontColor": "#FFD700",
                            "align": "center",
                            "bold": True,
                            "width": 794,
                            "fontStyle": 0,
                            "shadow": {"color": "#000000", "blur": 8, "offsetX": 2, "offsetY": 2}
                        },
                        {
                            "type": "text",
                            "id": "date",
                            "x": 0,
                            "y": 280,
                            "text": "Date: April 15th, 2026",
                            "fontSize": 32,
                            "fontFamily": "Montserrat",
                            "fontColor": "#FFFFFF",
                            "align": "center",
                            "width": 794
                        },
                        {
                            "type": "text",
                            "id": "location",
                            "x": 0,
                            "y": 350,
                            "text": "Location: The Card Shop",
                            "fontSize": 32,
                            "fontFamily": "Montserrat",
                            "fontColor": "#FFFFFF",
                            "align": "center",
                            "width": 794
                        },
                        {
                            "type": "text",
                            "id": "info",
                            "x": 100,
                            "y": 500,
                            "text": "Best of 3 • Swiss Format\nEntry: $25 • Prizes!",
                            "fontSize": 24,
                            "fontFamily": "Arial",
                            "fontColor": "#FFD700",
                            "align": "center",
                            "width": 594
                        }
                    ]
                }
            },
            {
                "name": "Event Poster",
                "category": "event",
                "canvas_data": {
                    "width": 794,
                    "height": 1123,
                    "background": {
                        "type": "linear",
                        "value": "linear,#1a1a2e,#16213e"
                    },
                    "objects": [
                        {
                            "type": "text",
                            "id": "event_title",
                            "x": 50,
                            "y": 100,
                            "text": "SPECIAL EVENT",
                            "fontSize": 64,
                            "fontFamily": "Bebas Neue",
                            "fontColor": "#00D9FF",
                            "bold": True,
                            "width": 694,
                            "shadow": {"color": "#000000", "blur": 10, "offsetX": 3, "offsetY": 3}
                        },
                        {
                            "type": "text",
                            "id": "event_desc",
                            "x": 50,
                            "y": 250,
                            "text": "Join us for an unforgettable experience!\nLimited spots available.",
                            "fontSize": 28,
                            "fontFamily": "Montserrat",
                            "fontColor": "#FFFFFF",
                            "width": 694,
                            "align": "left"
                        },
                        {
                            "type": "text",
                            "id": "event_date",
                            "x": 50,
                            "y": 450,
                            "text": "📅 May 20, 2026",
                            "fontSize": 32,
                            "fontFamily": "Montserrat",
                            "fontColor": "#00D9FF",
                            "bold": True,
                            "width": 694
                        },
                        {
                            "type": "text",
                            "id": "event_time",
                            "x": 50,
                            "y": 520,
                            "text": "🕐 6:00 PM - 10:00 PM",
                            "fontSize": 28,
                            "fontFamily": "Montserrat",
                            "fontColor": "#FFFFFF",
                            "width": 694
                        },
                        {
                            "type": "text",
                            "id": "event_cta",
                            "x": 150,
                            "y": 800,
                            "text": "Reserve Your Spot!",
                            "fontSize": 42,
                            "fontFamily": "Bebas Neue",
                            "fontColor": "#000000",
                            "bold": True,
                            "width": 494,
                            "align": "center",
                            "backgroundColor": "#00D9FF",
                            "padding": 20
                        }
                    ]
                }
            },
            {
                "name": "Card Announcement",
                "category": "announcement",
                "canvas_data": {
                    "width": 794,
                    "height": 1123,
                    "background": {
                        "type": "color",
                        "value": "#0a0e27"
                    },
                    "objects": [
                        {
                            "type": "text",
                            "id": "announce_header",
                            "x": 0,
                            "y": 100,
                            "text": "COMING SOON",
                            "fontSize": 68,
                            "fontFamily": "Bebas Neue",
                            "fontColor": "#FF6B6B",
                            "bold": True,
                            "width": 794,
                            "align": "center",
                            "shadow": {"color": "#000000", "blur": 12, "offsetX": 4, "offsetY": 4}
                        },
                        {
                            "type": "text",
                            "id": "announce_title",
                            "x": 50,
                            "y": 250,
                            "text": "New Card Set Release",
                            "fontSize": 48,
                            "fontFamily": "Oswald",
                            "fontColor": "#FFFFFF",
                            "bold": True,
                            "width": 694
                        },
                        {
                            "type": "text",
                            "id": "announce_desc",
                            "x": 50,
                            "y": 380,
                            "text": "Be ready for the most anticipated card set of the year!\nFully translated. Limited first edition.",
                            "fontSize": 24,
                            "fontFamily": "Montserrat",
                            "fontColor": "#E0E0E0",
                            "width": 694,
                            "lineHeight": 1.6
                        },
                        {
                            "type": "text",
                            "id": "announce_date",
                            "x": 50,
                            "y": 580,
                            "text": "Release Date: June 1st, 2026",
                            "fontSize": 32,
                            "fontFamily": "Bebas Neue",
                            "fontColor": "#FF6B6B",
                            "bold": True,
                            "width": 694
                        },
                        {
                            "type": "text",
                            "id": "announce_footer",
                            "x": 50,
                            "y": 950,
                            "text": "Pre-order now at your local card shop",
                            "fontSize": 22,
                            "fontFamily": "Arial",
                            "fontColor": "#AAAAAA",
                            "width": 694,
                            "align": "center"
                        }
                    ]
                }
            },
            {
                "name": "Championship Bracket",
                "category": "tournament",
                "canvas_data": {
                    "width": 794,
                    "height": 1123,
                    "background": {
                        "type": "color",
                        "value": "#1a1a1a"
                    },
                    "objects": [
                        {
                            "type": "text",
                            "id": "bracket_title",
                            "x": 0,
                            "y": 50,
                            "text": "CHAMPIONSHIP BRACKET",
                            "fontSize": 56,
                            "fontFamily": "Bebas Neue",
                            "fontColor": "#FFED4E",
                            "bold": True,
                            "width": 794,
                            "align": "center",
                            "shadow": {"color": "#000000", "blur": 8, "offsetX": 2, "offsetY": 2}
                        },
                        {
                            "type": "text",
                            "id": "bracket_season",
                            "x": 0,
                            "y": 140,
                            "text": "Season 2026 - Finals",
                            "fontSize": 28,
                            "fontFamily": "Montserrat",
                            "fontColor": "#CCCCCC",
                            "width": 794,
                            "align": "center"
                        },
                        {
                            "type": "text",
                            "id": "bracket_semi1",
                            "x": 50,
                            "y": 280,
                            "text": "Semi-Final 1",
                            "fontSize": 22,
                            "fontFamily": "Montserrat",
                            "fontColor": "#FFED4E",
                            "bold": True,
                            "width": 300
                        },
                        {
                            "type": "text",
                            "id": "bracket_semi2",
                            "x": 444,
                            "y": 280,
                            "text": "Semi-Final 2",
                            "fontSize": 22,
                            "fontFamily": "Montserrat",
                            "fontColor": "#FFED4E",
                            "bold": True,
                            "width": 300
                        },
                        {
                            "type": "text",
                            "id": "bracket_final",
                            "x": 200,
                            "y": 550,
                            "text": "FINALS",
                            "fontSize": 32,
                            "fontFamily": "Bebas Neue",
                            "fontColor": "#FF6B6B",
                            "bold": True,
                            "width": 394,
                            "align": "center"
                        },
                        {
                            "type": "text",
                            "id": "bracket_info",
                            "x": 50,
                            "y": 900,
                            "text": "Best of 3 • Live Streaming • Prize Pool",
                            "fontSize": 24,
                            "fontFamily": "Arial",
                            "fontColor": "#FFED4E",
                            "width": 694,
                            "align": "center"
                        }
                    ]
                }
            },
            {
                "name": "Generic Flyer",
                "category": "generic",
                "canvas_data": {
                    "width": 794,
                    "height": 1123,
                    "background": {
                        "type": "linear",
                        "value": "linear,#2d3436,#636e72"
                    },
                    "objects": [
                        {
                            "type": "text",
                            "id": "generic_title",
                            "x": 50,
                            "y": 150,
                            "text": "YOUR TITLE HERE",
                            "fontSize": 60,
                            "fontFamily": "Bebas Neue",
                            "fontColor": "#A29BFE",
                            "bold": True,
                            "width": 694,
                            "align": "center",
                            "shadow": {"color": "#000000", "blur": 8, "offsetX": 2, "offsetY": 2}
                        },
                        {
                            "type": "text",
                            "id": "generic_subtitle",
                            "x": 50,
                            "y": 280,
                            "text": "Add your main message here",
                            "fontSize": 32,
                            "fontFamily": "Montserrat",
                            "fontColor": "#FFFFFF",
                            "width": 694,
                            "align": "center"
                        },
                        {
                            "type": "text",
                            "id": "generic_desc",
                            "x": 50,
                            "y": 450,
                            "text": "Description or additional details go here.\nYou can add multiple lines of text.",
                            "fontSize": 24,
                            "fontFamily": "Arial",
                            "fontColor": "#DFE6E9",
                            "width": 694,
                            "align": "center",
                            "lineHeight": 1.5
                        },
                        {
                            "type": "text",
                            "id": "generic_cta",
                            "x": 0,
                            "y": 900,
                            "text": "www.example.com • contact@example.com",
                            "fontSize": 20,
                            "fontFamily": "Arial",
                            "fontColor": "#A29BFE",
                            "width": 794,
                            "align": "center"
                        }
                    ]
                }
            }
        ]

        for template_data in templates_data:
            template, created = Template.objects.get_or_create(
                name=template_data["name"],
                defaults={
                    "category": template_data["category"],
                    "canvas_data": template_data["canvas_data"],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created template: {template.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'✓ Template already exists: {template.name}'))

        self.stdout.write(self.style.SUCCESS('\n✅ All templates loaded successfully!'))
