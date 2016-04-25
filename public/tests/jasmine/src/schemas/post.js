var post = {
    id: {
        type: 'number'
    },
    date:{
        type: 'date'
    },
    campaign_active:{
        type: 'boolean'
    },
    sponsor: {
        type: 'object',
        properties:{
            rendered:{
                type: 'string'
            }
        }
    },
    parent: {
        type: 'number'
    },
    guid: {
        type: 'object',
        properties:{
            rendered:{
                type: 'string'
            }
        }
    },
    modified:{
        type: 'date'
    },
    modified_gmt:{
        type: 'date'
    },
    slug: {
        type: 'string'
    },
    type: {
        type: 'string'
    },
    link: {
        type: 'string'
    },
    title: {
        type: 'object',
        properties:{
            rendered:{
                type: 'string'
            }
        }
    },
    content: {
        type: 'object',
        properties:{
            rendered:{
                type: 'string'
            }
        }
    },
    excerpt: {
        type: 'object',
        properties:{
            rendered:{
                type: 'string'
            }
        }
    },
    author: {
        type: 'number'
    },
    featured_image: {
        type: 'number'
    },
    comment_status: {
        type: 'string'
    },
    ping_status: {
        type: 'string'
    },
    sticky: {
        type: 'boolean'
    },
    format: {
        type: 'string'
    },
    votes: {
        type: 'object',
        properties:{
            votes_up:{
                type: 'string'
            },
            votes_down:{
                type: 'string'
            },
            total_votes:{
                type: 'string'
            },
            votes_tally:{
                type: 'string'
            }
        }
    },
    comment_count: {
        type: 'object',
        properties:{
            total_comments: {
                type: 'number'
            },
            moderated: {
                type: 'number'
            },
            approved: {
                type: 'number'
            },
            spam: {
                type: 'number'
            },
            trash: {
                type: 'number'
            },
            'post-trashed': {
                type: 'number'
            }
        }
    },
    postmeta: {
        type: 'object',
        properties:{
            run_dates_0_channel:{
                type:'array',
                items:[
                    {
                        type:'string'
                    }
                ]
            },
            run_dates_0_run_time:{
                type:'array',
                items:[
                    {
                        type:'string'
                    }
                ]
            },
            facebook_message:{
                type:'array',
                items:[
                    {
                        type:'string'
                    }
                ]
            },
            oem_safe:{
                type:'array',
                items:[
                    {
                        type:'string'
                    }
                ]
            },
            explicit:{
                type:'array',
                items:[
                    {
                        type:'string'
                    }
                ]
            },
            explicit_type:{
                type:'array',
                items:[
                    {
                        type:'string'
                    }
                ]
            }
        }
    },
    category: {
        type: 'array',
        items: [
            {
                type:'object',
                properties: {
                    term_id:{
                        type: 'number'
                    },
                    name:{
                        type: 'string'
                    },
                    slug:{
                        type: 'string'
                    },
                    term_group:{
                        type: 'number'
                    },
                    term_taxonomy_id:{
                        type: 'number'
                    },
                    taxonomy:{
                        type: 'string'
                    },
                    description:{
                        type: 'string'
                    },
                    parent:{
                        type: 'number'
                    },
                    count:{
                        type: 'number'
                    },
                    filter:{
                        type: 'string'
                    }
                }
            }
        ]
    },
    featured_image_src: {
        type: 'object',
        properties:{
            original:{
                type: 'array',
                items:[
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            full:{
                type: 'array',
                items:[
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            large:{
                type: 'array',
                items:[
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            medium:{
                type: 'array',
                items:[
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            original_wp:{
                type: 'array',
                items:[
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            full_wp:{
                type: 'array',
                items:[
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            large_wp:{
                type: 'array',
                items:[
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            medium_wp:{
                type: 'array',
                items:[
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            thumbnail:{
                type: 'array',
                items:[
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ]
            }
        }
    },
    author_meta: {
        type: 'object',
        properties:{
            name:{
                type: 'string'
            }
        }
    }
};

module.exports = post;