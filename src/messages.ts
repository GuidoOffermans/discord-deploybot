export const selectMessage = (sites) => {
	const options = sites.map(site => {
		return {
			"label": site.name,
			"value": site.name,
		}
	})
	console.log("Options", options)

	return {
		"content": "Which site do you want to deploy to production",
		"components": [
			{
				"type": 1,
				"components": [
					{
						"type": 3,
						"custom_id": "select_site_to_deploy",
						"options": options,
						"placeholder": "Choose a site to deploy to production",
						"min_values": 1,
						"max_values": 1
					}
				]
			}
		]
	}
};

export const confirmMessage = (siteName) => ({
	"content": `are you sure you want to deploy ${siteName} to production?`,
	"components": [
		{
			"type": 1,
			"components": [
				{
					"type": 2,
					"style": 4,
					"custom_id": "deploy_cancel",
					"label": `Cancel`
				},
				{
					"type": 2,
					"style": 1,
					"custom_id": `deploy_confirm_${siteName}`,
					"label": `Deploy ${siteName}`
				}
			]
		}
	]
})

export const deploySucceeded = (siteName) => ({
	"content": `Deploy to ${siteName} succeeded!`,
	"components": [
		{
			"type": 1,
			"components": [
				{
					"type": 2,
					"style": 3,
					"custom_id": "deploy_confirm",
					"disabled": true,
					"label": `Deploy succeeded!`
				}
			]
		}
	]
})

export const deployFailed = (siteName) => ({
	"content": `Deploy to ${siteName} failed!`,
	"components": [
		{
			"type": 1,
			"components": [
				{
					"type": 2,
					"style": 4,
					"custom_id": "deploy_cancel",
					"disabled": true,
					"label": `Deploy Failed`
				},
			]
		}
	]
})

export const confirmMessageDenied = {
	"content": `You have cancelled the deploy`,
	"components": [
		{
			"type": 1,
			"components": [
				{
					"type": 2,
					"style": 4,
					"custom_id": "deploy_cancel",
					"disabled": true,
					"label": `Cancelled Deploy`
				},
			]
		}
	]
}

export const messageModal = {
	"title": "Setup a deploy website",
	"custom_id": "setup_deploy_website",
	"components": [
		{
			"type": 1,
			"components": [{
				"type": 4,
				"custom_id": "website",
				"label": "Website",
				"style": 1,
				"min_length": 1,
				"max_length": 4000,
				"placeholder": "test.com",
				"required": true
			}]
		},
		{
			"type": 1,
			"components": [{
				"type": 4,
				"custom_id": "webhook",
				"label": "Webhook",
				"style": 1,
				"min_length": 1,
				"max_length": 4000,
				"placeholder": "https://........",
				"required": true
			},]
		},
	]
}

