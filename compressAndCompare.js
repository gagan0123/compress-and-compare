const fs = require('fs');
const zlib = require('zlib');
const { minify: minifyJS } = require('terser');
const CleanCSS = require('clean-css');

async function compressAndCompare(filePath) {
	// Read the file content
	const originalContent = fs.readFileSync(filePath, 'utf8');

	// Get the original size
	const originalSize = Buffer.byteLength(originalContent, 'utf8');
	console.log(`Original Size: ${originalSize} bytes`);

	// Perform Brotli compression on original content
	zlib.brotliCompress(originalContent, async (err, originalCompressed) => {
		if (err) throw err;

		console.log(`Original Compressed Size: ${originalCompressed.length} bytes`);
		const originalCompressionPercentage = Math.ceil((1 - (originalCompressed.length / originalSize)) * 100);
		console.log(`Compression Percentage (Original): ${originalCompressionPercentage}%`);

		// Determine file type and minify accordingly
		if (filePath.endsWith('.js')) {
			// Minify JavaScript
			try {
				const minifiedResult = await minifyJS(originalContent);
				processMinifiedContent(minifiedResult.code);
			} catch (error) {
				console.error('Error minifying JS:', error);
			}
		} else if (filePath.endsWith('.css')) {
			// Minify CSS
			const minifiedResult = new CleanCSS().minify(originalContent);
			processMinifiedContent(minifiedResult.styles);
		} else {
			console.log('Unsupported file type. Please provide a .js or .css file.');
		}
	});

	function processMinifiedContent(minifiedContent) {
		// Perform Brotli compression on minified content
		zlib.brotliCompress(minifiedContent, (err, minifiedCompressed) => {
			if (err) throw err;

			console.log(`Minified & Compressed Size: ${minifiedCompressed.length} bytes`);
			const minifiedCompressionPercentage = Math.ceil((1 - (minifiedCompressed.length / originalSize)) * 100);
			console.log(`Compression Percentage (Minified & Compressed): ${minifiedCompressionPercentage}%`);
		});
	}
}

// Check if a file path is provided
if (process.argv.length < 3) {
	console.log('Usage: node script.js <path_to_js_or_css_file>');
	process.exit(1);
}

const filePath = process.argv[2];
compressAndCompare(filePath);
