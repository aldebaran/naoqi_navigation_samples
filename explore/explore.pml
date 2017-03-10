<?xml version="1.0" encoding="UTF-8" ?>
<Package name="explore" format_version="4">
    <Manifest src="manifest.xml" />
    <BehaviorDescriptions>
        <BehaviorDescription name="behavior" src="explore_display" xar="behavior.xar" />
        <BehaviorDescription name="behavior" src="explore_move" xar="behavior.xar" />
        <BehaviorDescription name="behavior" src="all" xar="behavior.xar" />
    </BehaviorDescriptions>
    <Dialogs />
    <Resources>
        <File name="index" src="html/index.html" />
        <File name="jquery-1.11.0.min" src="html/js/jquery-1.11.0.min.js" />
        <File name="main" src="html/js/main.js" />
        <File name="robotutils" src="html/js/robotutils.js" />
        <File name="icon" src="html/img/icon.png" />
    </Resources>
    <Topics />
    <IgnoredPaths>
        <Path src="README.md" />
    </IgnoredPaths>
    <Translations auto-fill="en_US">
        <Translation name="translation_en_US" src="translations/translation_en_US.ts" language="en_US" />
    </Translations>
</Package>
