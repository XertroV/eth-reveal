#!/usr/bin/env node
'use strict';

const { formatEther } = require('ethers').utils;
const program = require('commander');
const numbro = require('numbro');
const util = require('util');
const { gray, red, yellow, green, cyan } = require('chalk');
const { lookup } = require('./lib');

// perform as CLI tool if args given
if (require.main === module) {
	(async () => {
		require('pretty-error').start();

		program
			.option('-h, --hash <value>', 'Transaction hash (include 0x prefix)')
			.parse(process.argv);

		const { hash } = program;
		console.log(gray('txn:', `https://etherscan.io/tx/${hash}`));

		const {
			from,
			contract,
			method,
			decodedLogs,
			gasUsed,
			status,
			errorMessage,
			revertReason,
			value,
		} = await lookup({
			hash: program.hash,
		});

		console.log(gray('from:', from));
		if (contract) console.log(gray('contract:', contract));
		if (method)
			console.log(
				'method:',
				util.inspect(method, {
					showHidden: true,
					depth: null,
				})
			);

		if (decodedLogs && decodedLogs.length)
			console.log(
				gray(
					'logs:',
					util.inspect(decodedLogs, {
						showHidden: true,
						depth: null,
					})
				)
			);

		if (Number(formatEther(value)) > 0) console.log(gray('value:', formatEther(value), 'ETH'));

		console.log(
			gray(
				`Gas used: ${numbro(gasUsed).format({ average: true })} (${numbro(gasUsed).format('0,0')})`
			)
		);
		console.log(gray('Status:'), status > 0 ? green('success') : red('failure'));

		if (errorMessage) {
			console.log('ES error:', cyan(errorMessage));
		}
		if (revertReason) {
			console.log('Revert reason:', yellow(revertReason));
		}
	})();
}

module.exports = lookup;
