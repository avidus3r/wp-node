var configSchema = {
    appname:{
        type: 'object',
        properties:{
            app:{
                type: 'object',
                properties:{
                    name: {
                        type: 'string'
                    },
                    title: {
                        type: 'string'
                    },
                    description:{
                        type: 'string'
                    },
                    url:{
                        type: 'string'
                    },
                    per_page:{
                        type: 'number'
                    },
                    prefetch_at:{
                        type: 'number'
                    },
                    scroll_amount:{
                        type: 'number'
                    },
                    avatar:{
                        type: 'string'
                    },
                    loading_message:{
                        type: 'string'
                    },
                    fb_sitename:{
                        type: 'string'
                    },
                    fb_appid:{
                        type: 'number'
                    },
                    fb_pixel_id:{
                        type: 'number'
                    },
                    fb_url:{
                        type: 'string'
                    },
                    feedPath:{
                        type: 'string'
                    },
                    ga:{
                        type: 'string'
                    },
                    gtm_id:{
                        type: 'string'
                    },
                    adsPerPage:{
                        type: 'number'
                    },
                    displayAds:{
                        type: 'boolean'
                    },
                    sponsors:{
                        type: 'number'
                    },
                    pubads:{
                        type: 'object',
                        properties:{
                            desktop:{
                                type: 'array',
                                items:{
                                    type: 'object',
                                    properties:{
                                        slot:{
                                            type: 'string'
                                        },
                                        dimensions:{
                                            type: 'array',
                                            items:{
                                                type: 'number'
                                            },
                                            minItems: 2
                                        },
                                        tagID:{
                                            type: 'string'
                                        }
                                    }
                                },
                                minItems: 1
                            },
                            mobile:{
                                type: 'array',
                                items:{
                                    type: 'object',
                                    properties:{
                                        slot:{
                                            type: 'string'
                                        },
                                        dimensions:{
                                            type: 'array',
                                            items:{
                                                type: 'number'
                                            },
                                            minItems: 2
                                        },
                                        tagID:{
                                            type: 'string'
                                        }
                                    }
                                },
                                minItems: 1
                            }
                        }
                    },
                    env:{
                        type: 'object',
                        properties:{
                            'awsprod':{
                                type: 'object',
                                properties:{
                                    remoteUrl:{
                                        type: 'string'
                                    },
                                    basePath: {
                                        type: 'string'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = configSchema;