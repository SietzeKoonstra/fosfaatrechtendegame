<?php
echo'<!DOCTYPE html>
<html>
<head>
    <script src="//cdn.jsdelivr.net/npm/phaser@3.12/dist/phaser.js"></script>
	<link href="stylesheet.css" type="text/css" rel="stylesheet" />
	<script src="game.js" type="module"></script>
	<title>Fosfaatrechten de Game</title>
</head>
<body>
<div class="content">
	<h1> Fosfaatrechten de Game</h1>
	<div class="uitleg">
		<p>Fosfaatrechten de game: verzamel zoveel fosfaatrechten als je kunt. Maar pas op! Als Jesse je pakt kost dat je een leven. 
		Als Tjeerd je pakt kost dat naast een leven ook nog eens de helft van je fosfaatrechten. Bij 0 levens of minder dan 20 fosfaatrechten, ben je dood.</p>
	</div>
	<div class="gameDingen">
		<div id="score"></div>
		<div id="levens"></div>
	</div>
	<div id="game"></div>
</div>
</body>
</html>';
?>