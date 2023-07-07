const data = {
	name: 'root',
	y: 10,
	children: [
		{
			name: 'stack',
			group: '0',
			y: 10,
			children: [
				{
					name: 'stack',
					group: '0-0',
					y: 4,
					children: [
						{
							name: 'sound',
							group: '0-0-0',
							y: 2,
							value: '_hh*8',
						},
						{
							name: '.gain',
							group: '0-0-0',
							y: 3,
							value: '_[.25 1]*2',
						},

						{
							name: 'sound',
							group: '0-0-1',
							y: 6,
							value: '_bd*2,~ sd:1',
						},
					],
				},
				{
					name: 'note',
					group: '0-1',
					y: 9,
					value: '_<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2',
				},
				{
					name: '.sound',
					group: '0-1',
					y: 10,
					value: 'sawtooth',
				},
				{
					name: '.lpf',
					group: '0-1',
					y: 11,
					value: '_200 1000',
				},

				{
					name: 'note',
					group: '0-2',
					y: 14,
					value: '_<[c3,g3,e4] [bb2,f3,d4] [a2,f3,c4] [bb2,g3,eb4]>/2',
				},
				{
					name: '.sound',
					group: '0-2',
					y: 15,
					value: 'sawtooth',
				},
				{
					name: '.vowel',
					group: '0-2',
					y: 16,
					value: '_<a e i o>/2',
				},
			],
		},
		{
			name: '.pianoroll',
			group: '0',
			y: 11,
		},
	],
};

export default data;
